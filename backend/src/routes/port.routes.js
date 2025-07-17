import { Router } from "express";
import {
  createPort,
  updatePort,
  getPorts,
  archivePort,
} from "../controllers/port.controller.js";

const router = Router();

router.post("/", createPort);
router.get("/", getPorts);
router.put("/:id", updatePort);
router.patch("/:id/archive", archivePort);

export default router;
