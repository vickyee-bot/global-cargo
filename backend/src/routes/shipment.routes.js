import { Router } from "express";
import {
  createShipment,
  updateShipmentStatus,
  getShipments,
  cancelShipment,
} from "../controllers/shipment.controller.js";

const router = Router();

router.post("/", createShipment);
router.get("/", getShipments);
router.patch("/:id/status", updateShipmentStatus);
router.patch("/:id/cancel", cancelShipment);

export default router;
