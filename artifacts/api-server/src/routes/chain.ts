import { Router } from "express";
import { apiError, ErrorCode } from "../lib/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { getSkillOnChain, getBalance, getOracleVerifiedOwner } from "../services/chain.js";
import { invalidate, invalidatePrefix, cacheKey } from "../services/cache.js";

const router = Router();

// GET /api/chain/skill/:tokenId
router.get("/chain/skill/:tokenId", async (req, res) => {
  const tokenId = parseInt(req.params.tokenId, 10);
  if (isNaN(tokenId) || tokenId < 0) {
    apiError(res, ErrorCode.INVALID_INPUT, "Invalid tokenId");
    return;
  }
  try {
    const data = await getSkillOnChain(tokenId);
    res.json(data);
  } catch {
    apiError(res, ErrorCode.RPC_ERROR, "Failed to read skill from chain");
  }
});

// GET /api/chain/balance/:address
router.get("/chain/balance/:address", async (req, res) => {
  const { address } = req.params;
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    apiError(res, ErrorCode.INVALID_INPUT, "Invalid EVM address");
    return;
  }
  try {
    const data = await getBalance(address);
    res.json(data);
  } catch {
    apiError(res, ErrorCode.RPC_ERROR, "Failed to read balance from chain");
  }
});

// GET /api/chain/oracle/:tokenId
router.get("/chain/oracle/:tokenId", async (req, res) => {
  const tokenId = parseInt(req.params.tokenId, 10);
  if (isNaN(tokenId) || tokenId < 0) {
    apiError(res, ErrorCode.INVALID_INPUT, "Invalid tokenId");
    return;
  }
  try {
    const data = await getOracleVerifiedOwner(tokenId);
    res.json(data);
  } catch {
    apiError(res, ErrorCode.RPC_ERROR, "Failed to read oracle from chain");
  }
});

// DELETE /api/chain/cache — manual cache invalidation (platform admin wallet required)
router.delete("/chain/cache", authMiddleware("admin:cache-invalidate"), (req, res) => {
  const PLATFORM_OWNER = process.env.DEPLOYER_ADDRESS?.toLowerCase();
  if (!PLATFORM_OWNER || req.walletAddress?.toLowerCase() !== PLATFORM_OWNER) {
    apiError(res, ErrorCode.FORBIDDEN, "Platform owner access required");
    return;
  }

  const { key, prefix } = req.query as Record<string, string>;
  if (prefix) {
    invalidatePrefix(prefix);
    res.json({ invalidated: "prefix", prefix });
  } else if (key) {
    invalidate(key);
    res.json({ invalidated: "key", key });
  } else {
    // Invalidate all chain read cache entries by their shared chainId prefix
    invalidatePrefix(`${16661}:`);
    res.json({ invalidated: "all", chainId: 16661 });
  }
});

export default router;
