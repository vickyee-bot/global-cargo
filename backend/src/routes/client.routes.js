import { Router } from "express";
import {
  createClient,
  updateClient,
  getClients,
  deactivateClient
} from "../controllers/client.controller.js";

const router = Router();

router.post("/", createClient);
router.get("/", getClients);
router.put("/:id", updateClient);
router.patch("/:id/deactivate", deactivateClient);

export default router;
