import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { keysRouter } from "./keys";
import { notificationsRouter } from "./notifications";
import { loginHistoryRouter } from "./login-history";
import { settingsRouter } from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/keys", keysRouter);
router.use("/notifications", notificationsRouter);
router.use("/login-history", loginHistoryRouter);
router.use("/settings", settingsRouter);

export default router;
