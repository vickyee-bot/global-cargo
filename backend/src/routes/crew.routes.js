import { Router } from "express";
import {
  createCrewMember,
  updateCrewMember,
  getCrewMembers,
  deactivateCrewMember,
} from "../controllers/crew.controller.js";

const router = Router();

router.post("/", createCrewMember);
router.get("/", getCrewMembers);
router.put("/:id", updateCrewMember);
router.patch("/:id/deactivate", deactivateCrewMember);

export default router;
