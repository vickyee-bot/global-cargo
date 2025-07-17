import { Router } from "express";
import {
  createCargo,
  updateCargo,
  getCargo,
  deactivateCargo,
} from "../controllers/cargo.controller.js";

const router = Router();

router.post("/", createCargo);
router.get("/", getCargo);
router.put("/:id", updateCargo);
router.patch("/:id/deactivate", deactivateCargo);

export default router;
