import { Router } from "express";
import { db } from "@workspace/db";
import { githubVerificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateId } from "../lib/id.js";
import { apiError, ErrorCode } from "../lib/errors.js";
import { challengeHandler, authMiddleware } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

// ---------------------------------------------------------------------------
// EIP-712 challenge nonce
// ---------------------------------------------------------------------------
router.get("/auth/challenge", challengeHandler);

// ---------------------------------------------------------------------------
// GitHub OAuth
// ---------------------------------------------------------------------------
router.get("/auth/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    apiError(res, ErrorCode.INTERNAL, "GitHub OAuth not configured (GITHUB_CLIENT_ID not set)");
    return;
  }
  const callbackUrl = `${process.env.API_BASE_URL ?? ""}/api/auth/github/callback`;
  const state = Math.random().toString(36).slice(2);
  req.session.oauthState = state;
  // Store return path so callback can redirect back to the originating page
  const returnTo = (req.query.return_to as string | undefined) ?? "/app/claim";
  req.session.oauthReturnTo = returnTo.startsWith("/") ? returnTo : "/app/claim";

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  // Request 'repo' scope so we can fetch private repo files during skill registration.
  // If the user previously authed with only 'read:user' they'll be prompted by GitHub to re-approve.
  const wantsRepo = req.query.scope === "repo";
  url.searchParams.set("scope", wantsRepo ? "read:user repo" : "read:user");
  url.searchParams.set("state", state);
  res.redirect(url.toString());
});

router.get("/auth/github/callback", async (req, res) => {
  const { code, state } = req.query as Record<string, string>;
  const sessionState = req.session.oauthState;

  if (!state || state !== sessionState) {
    apiError(res, ErrorCode.INVALID_INPUT, "OAuth state mismatch");
    return;
  }

  const clientId     = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    apiError(res, ErrorCode.INTERNAL, "GitHub OAuth not configured");
    return;
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      logger.warn({ error: tokenData.error }, "github token exchange failed");
      apiError(res, ErrorCode.UNAUTHORIZED, "GitHub OAuth failed");
      return;
    }

    // Fetch authenticated user
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": "SkillFun/1.0" },
    });
    const user = await userRes.json() as { login?: string };
    if (!user.login) {
      apiError(res, ErrorCode.INTERNAL, "Could not fetch GitHub user");
      return;
    }

    // Upsert github_verifications with empty evmAddress (linked via /auth/link-wallet later)
    const existingEvm = req.session.walletAddress ?? "";
    await db.insert(githubVerificationsTable).values({
      id:             generateId("gv"),
      githubUsername: user.login,
      evmAddress:     existingEvm,
    }).onConflictDoUpdate({
      target: githubVerificationsTable.githubUsername,
      set: { verifiedAt: new Date() },
    });

    req.session.githubUsername = user.login;
    req.session.githubToken    = tokenData.access_token;
    // Record whether this token has private-repo scope so the skill-manifest
    // endpoint can use it and the frontend knows re-auth isn't needed.
    const scopes: string = (tokenRes.headers.get("x-oauth-scopes") ?? "");
    req.session.githubTokenHasRepoScope = scopes.split(",").map((s) => s.trim()).includes("repo");
    const returnTo = req.session.oauthReturnTo ?? "/app/claim";
    req.session.oauthState    = undefined;
    req.session.oauthReturnTo = undefined;
    logger.info({ githubUsername: user.login, hasRepoScope: req.session.githubTokenHasRepoScope }, "github oauth success");

    const frontendUrl = process.env.FRONTEND_URL ?? "";
    res.redirect(`${frontendUrl}${returnTo}?github_auth=success`);
  } catch (err) {
    logger.error({ err }, "github oauth callback error");
    apiError(res, ErrorCode.INTERNAL, "OAuth callback failed");
  }
});

// ---------------------------------------------------------------------------
// Current session info
// ---------------------------------------------------------------------------
router.get("/auth/me", async (req, res) => {
  const githubUsername = req.session.githubUsername;
  if (!githubUsername) {
    res.json({ authenticated: false });
    return;
  }

  const [verification] = await db
    .select()
    .from(githubVerificationsTable)
    .where(eq(githubVerificationsTable.githubUsername, githubUsername))
    .limit(1);

  res.json({
    authenticated: true,
    githubUsername,
    evmAddress: verification?.evmAddress || null,
  });
});

// ---------------------------------------------------------------------------
// Link wallet address to current GitHub session
// Requires: active GitHub session + valid EIP-712 wallet signature
// The signed action proves the user controls the private key for the address.
// ---------------------------------------------------------------------------
router.post("/auth/link-wallet", authMiddleware("link-wallet"), async (req, res) => {
  const githubUsername = req.session.githubUsername;
  if (!githubUsername) {
    apiError(res, ErrorCode.UNAUTHORIZED, "GitHub authentication required before linking a wallet");
    return;
  }

  // walletAddress is recovered from the signature — not taken from the request body
  const evmAddress = req.walletAddress!;

  await db.insert(githubVerificationsTable).values({
    id:             generateId("gv"),
    githubUsername,
    evmAddress,
  }).onConflictDoUpdate({
    target: githubVerificationsTable.githubUsername,
    set: { evmAddress, verifiedAt: new Date() },
  });

  req.session.walletAddress = evmAddress;
  logger.info({ githubUsername, evmAddress }, "wallet linked to github account");
  res.json({ success: true, evmAddress });
});

export default router;
