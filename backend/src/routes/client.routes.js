import { Router } from "express";
import {
  createClient,
  updateClient,
  getClients,
  getClientById,
  deactivateClient,
  reactivateClient,
  getClientStats
} from "../controllers/client.controller.js";
import { authenticateToken } from "../controllers/auth.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post("/", createClient);
router.get("/", getClients);
router.get("/stats", getClientStats);
router.get("/:id", getClientById);
router.put("/:id", updateClient);
router.patch("/:id/deactivate", deactivateClient);
router.patch("/:id/reactivate", reactivateClient);

export default router;
