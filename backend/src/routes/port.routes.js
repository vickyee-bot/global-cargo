import { Router } from "express";
import {
  createPort,
  updatePort,
  getPorts,
  getPortById,
  getPortsForMap,
  archivePort,
  reactivatePort,
  getPortStats,
  validateCapacityForShip
} from "../controllers/port.controller.js";
import { authenticateToken } from "../controllers/auth.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post("/", createPort);
router.get("/", getPorts);
router.get("/map", getPortsForMap);
router.get("/stats", getPortStats);
router.get("/:id", getPortById);
router.put("/:id", updatePort);

// Status operations
router.patch("/:id/archive", archivePort);
router.patch("/:id/reactivate", reactivatePort);

// Validation operations
router.get("/:portId/validate-ship/:shipId", validateCapacityForShip);

export default router;
