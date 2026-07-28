import type { Request, Response, NextFunction } from "express";
import { recoverTypedDataAddress } from "viem";
import { apiError, ErrorCode } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

// ---------------------------------------------------------------------------
// EIP-712 domain + types for SkillFun management actions
// ---------------------------------------------------------------------------
const EIP712_DOMAIN = {
  name: "SkillFun",
  version: "1",
  chainId: 16661,
} as const;

export const EIP712_TYPES = {
  Action: [
    { name: "action",    type: "string" },
    { name: "nonce",     type: "string" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

// ---------------------------------------------------------------------------
// Challenge endpoint
// ---------------------------------------------------------------------------

/**
 * GET /api/auth/challenge
 * Issues a one-time nonce. The frontend signs this nonce in an EIP-712 message
 * and sends the signature back as X-Wallet-Signature.
 */
export function challengeHandler(req: Request, res: Response): void {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  req.session.challengeNonce = nonce;
  req.session.challengeIssuedAt = Date.now();
  res.json({ nonce });
}

// ---------------------------------------------------------------------------
// EIP-712 auth middleware
// ---------------------------------------------------------------------------

/**
 * Middleware: verify X-Wallet-Signature header.
 *
 * Header value is JSON-encoded { action, nonce, timestamp, signature }
 *
 * Security properties:
 * - Nonce must have been issued by this server to this session (replay-proof)
 * - Timestamp must be within ±5 minutes (prevents clock-skew replays)
 * - Nonce is consumed after first use (replay within window blocked)
 * - `action` must match the string the route expects (bind to route)
 *
 * On success: sets req.walletAddress (checksummed) and next() is called.
 */
export function authMiddleware(expectedAction?: string) {
  return async (
    req: Request & { walletAddress?: string },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const raw = req.headers["x-wallet-signature"];
    if (!raw || typeof raw !== "string") {
      apiError(res, ErrorCode.UNAUTHORIZED, "Missing X-Wallet-Signature header");
      return;
    }

    let parsed: { action: string; nonce: string; timestamp: number; signature: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      apiError(res, ErrorCode.INVALID_SIGNATURE, "Invalid signature header format");
      return;
    }

    const { action, nonce, timestamp, signature } = parsed;

    if (!action || !nonce || !timestamp || !signature) {
      apiError(res, ErrorCode.INVALID_SIGNATURE, "Signature header missing required fields");
      return;
    }

    // Bind action to expected route (if caller specifies)
    if (expectedAction && action !== expectedAction) {
      apiError(res, ErrorCode.INVALID_SIGNATURE, `Expected action '${expectedAction}', got '${action}'`);
      return;
    }

    // Two-sided timestamp window: ±5 minutes
    const nowSec = Math.floor(Date.now() / 1000);
    const drift = Math.abs(nowSec - timestamp);
    if (drift > 5 * 60) {
      apiError(res, ErrorCode.INVALID_SIGNATURE, "Signature timestamp out of window (±5 min)");
      return;
    }

    // Nonce must have been issued by our challenge endpoint to THIS session
    const sessionNonce = req.session.challengeNonce;
    if (!sessionNonce || nonce !== sessionNonce) {
      apiError(res, ErrorCode.INVALID_SIGNATURE, "Nonce was not issued to this session");
      return;
    }

    // Consume the nonce immediately (one-time use).
    // We persist the session before calling next() so that concurrent requests
    // sharing this session cannot both read the same nonce and both pass.
    req.session.challengeNonce = undefined;
    req.session.challengeIssuedAt = undefined;

    try {
      const recovered = await recoverTypedDataAddress({
        domain: EIP712_DOMAIN,
        types: EIP712_TYPES,
        primaryType: "Action",
        message: { action, nonce, timestamp: BigInt(timestamp) },
        signature: signature as `0x${string}`,
      });

      req.walletAddress = recovered.toLowerCase();

      // Durably save the consumed nonce before proceeding so a concurrent
      // request with the same session/nonce will find an empty challengeNonce
      // and be rejected, preventing replay under concurrent load.
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => (err ? reject(err) : resolve()));
      });

      logger.debug({ walletAddress: req.walletAddress, action }, "auth ok");
      next();
    } catch (err) {
      logger.warn({ err }, "auth signature verification failed");
      apiError(res, ErrorCode.INVALID_SIGNATURE, "Invalid signature");
    }
  };
}

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      walletAddress?: string;
    }
  }
}
