import { Router } from "express";
import {
  createJourney,
  startJourney,
  getJourneys,
  getJourneyById,
  updateShipPosition,
  getActiveShipPositions,
  cancelJourney
} from "../controllers/journey.controller.js";
import { authenticateToken } from "../controllers/auth.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Journey management
router.post("/", createJourney);                    // POST /api/journeys - Create journey
router.get("/", getJourneys);                      // GET /api/journeys - Get all journeys
router.get("/active-positions", getActiveShipPositions); // GET /api/journeys/active-positions
router.get("/:id", getJourneyById);                // GET /api/journeys/:id - Get journey by ID
router.patch("/:id/start", startJourney);          // PATCH /api/journeys/:id/start - Start journey
router.patch("/:id/cancel", cancelJourney);        // PATCH /api/journeys/:id/cancel - Cancel journey

// Position tracking
router.post("/ships/:shipId/position", updateShipPosition); // POST /api/journeys/ships/:shipId/position

export default router;