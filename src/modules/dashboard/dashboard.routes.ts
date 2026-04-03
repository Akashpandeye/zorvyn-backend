import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(requireRole("ANALYST", "ADMIN"));

router.get("/summary", dashboardController.getSummary);
router.get("/category-breakdown", dashboardController.getCategoryBreakdown);
router.get("/monthly-trends", dashboardController.getMonthlyTrends);
router.get("/recent-activity", dashboardController.getRecentActivity);

export default router;
