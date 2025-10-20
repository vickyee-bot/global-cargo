import { Router } from "express";
import {
  createShip,
  updateShip,
  getShips,
  getShipById,
  decommissionShip,
} from "../controllers/ship.controller.js";
import { authenticateToken } from "../controllers/auth.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post("/", createShip);
router.get("/", getShips);
router.get("/:id", getShipById);
router.put("/:id", updateShip);
router.patch("/:id/decommission", decommissionShip);

export default router;
