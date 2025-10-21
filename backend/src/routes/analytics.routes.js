import { Router } from "express";
import {
  getFleetUtilization,
  getRouteEfficiency,
  getCrewAnalytics,
  getPortPerformance,
  getPredictiveInsights,
  getDashboardAnalytics
} from "../controllers/analytics.controller.js";
import { authenticateToken } from "../controllers/auth.controller.js";

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Individual analytics endpoints
router.get("/fleet-utilization", getFleetUtilization);
router.get("/route-efficiency", getRouteEfficiency);
router.get("/crew-analytics", getCrewAnalytics);
router.get("/port-performance", getPortPerformance);
router.get("/predictive-insights", getPredictiveInsights);

// Comprehensive dashboard analytics
router.get("/dashboard", getDashboardAnalytics);

export default router;