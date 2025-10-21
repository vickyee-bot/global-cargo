import { Router } from "express";
import {
  createCargo,
  updateCargo,
  getCargo,
  getCargoById,
  deactivateCargo,
  reactivateCargo,
  getCargoStats
} from "../controllers/cargo.controller.js";
import { authenticateToken } from "../controllers/auth.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post("/", createCargo);
router.get("/", getCargo);
router.get("/stats", getCargoStats);
router.get("/:id", getCargoById);
router.put("/:id", updateCargo);
router.patch("/:id/deactivate", deactivateCargo);
router.patch("/:id/reactivate", reactivateCargo);

export default router;
