import { Router, type IRouter } from "express";
import healthRouter from "./health";
import forgeRouter from "./forge";
import githubRouter from "./github";

const router: IRouter = Router();

router.use(healthRouter);
router.use(forgeRouter);
router.use(githubRouter);

export default router;
