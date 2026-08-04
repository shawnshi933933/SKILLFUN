import { Router, type IRouter } from "express";
import healthRouter       from "./health.js";
import authRouter         from "./auth.js";
import chainRouter        from "./chain.js";
import skillsRouter       from "./skills.js";
import skillContentRouter from "./skill-content.js";
import bundlesRouter      from "./bundles.js";
import claimsRouter       from "./claims.js";
import adminRouter        from "./admin.js";
import githubRouter       from "./github.js";
import mcpRouter          from "./mcp.js";
import curatorRouter      from "./curator.js";
import assetsRouter       from "./assets.js";
import creatorRouter      from "./creator.js";
import statsRouter        from "./stats.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(chainRouter);
router.use(skillsRouter);
router.use(skillContentRouter);
router.use(bundlesRouter);
router.use(claimsRouter);
router.use(adminRouter);
router.use(githubRouter);
router.use(mcpRouter);
router.use(curatorRouter);
router.use(assetsRouter);
router.use(creatorRouter);
router.use(statsRouter);

export default router;
