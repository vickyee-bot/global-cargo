import { Router } from "express";
import {
  getDashboardData,
  getOperationalStats,
  getCriticalAlerts
} from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../controllers/auth.controller.js";

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Main dashboard data endpoint
router.get("/", getDashboardData);

// Quick operational statistics
router.get("/stats", getOperationalStats);

// Critical alerts only
router.get("/alerts", getCriticalAlerts);

export default router;