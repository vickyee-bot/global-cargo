import { Router } from "express";
import {
  createShipment,
  updateShipmentStatus,
  updateShipment,
  getShipments,
  getShipmentById,
  getShipmentsTimeline,
  cancelShipment,
  getShipmentStats
} from "../controllers/shipment.controller.js";
import { authenticateToken } from "../controllers/auth.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post("/", createShipment);
router.get("/", getShipments);
router.get("/timeline", getShipmentsTimeline);
router.get("/stats", getShipmentStats);
router.get("/:id", getShipmentById);
router.put("/:id", updateShipment);

// Status operations
router.patch("/:id/status", updateShipmentStatus);
router.patch("/:id/cancel", cancelShipment);

export default router;
