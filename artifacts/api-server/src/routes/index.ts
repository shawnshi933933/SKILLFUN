import { Router, type IRouter } from "express";
import healthRouter  from "./health.js";
import authRouter    from "./auth.js";
import chainRouter   from "./chain.js";
import skillsRouter  from "./skills.js";
import bundlesRouter from "./bundles.js";
import claimsRouter  from "./claims.js";
import adminRouter   from "./admin.js";
import githubRouter  from "./github.js";
import mcpRouter     from "./mcp.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(chainRouter);
router.use(skillsRouter);
router.use(bundlesRouter);
router.use(claimsRouter);
router.use(adminRouter);
router.use(githubRouter);
router.use(mcpRouter);

export default router;
