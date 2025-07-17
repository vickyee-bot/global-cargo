import { Router } from "express";
import {
  createShip,
  updateShip,
  getShips,
  decommissionShip,
} from "../controllers/ship.controller.js";

const router = Router();

router.post("/", createShip);
router.get("/", getShips);
router.put("/:id", updateShip);
router.patch("/:id/decommission", decommissionShip);

export default router;
