import { Router } from "express";
import {
  createCrewMember,
  updateCrewMember,
  getCrewMembers,
  getCrewMemberById,
  assignToShip,
  unassignFromShip,
  deactivateCrewMember,
  reactivateCrewMember,
  getAvailableCrew,
  getCrewStats
} from "../controllers/crew.controller.js";
import { authenticateToken } from "../controllers/auth.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post("/", createCrewMember);
router.get("/", getCrewMembers);
router.get("/available", getAvailableCrew);
router.get("/stats", getCrewStats);
router.get("/:id", getCrewMemberById);
router.put("/:id", updateCrewMember);

// Assignment operations
router.patch("/:id/assign", assignToShip);
router.patch("/:id/unassign", unassignFromShip);

// Status operations
router.patch("/:id/deactivate", deactivateCrewMember);
router.patch("/:id/reactivate", reactivateCrewMember);

export default router;
