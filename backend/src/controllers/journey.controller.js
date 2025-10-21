import prisma from "../prisma.js";

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3440.065; // Radius of Earth in nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate bearing between two coordinates
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - 
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

// ✅ Create a new journey (assign ship to route)
export const createJourney = async (req, res) => {
  try {
    const { shipId, originPortId, destinationPortId, departureTime, speed = 12 } = req.body;

    // Validate ship exists and is active
    const ship = await prisma.ship.findFirst({
      where: { id: shipId, isActive: true, status: 'active' }
    });
    
    if (!ship) {
      return res.status(404).json({ error: "Ship not found or not active" });
    }

    // Validate ports exist
    const [originPort, destinationPort] = await Promise.all([
      prisma.port.findUnique({ where: { id: originPortId } }),
      prisma.port.findUnique({ where: { id: destinationPortId } })
    ]);

    if (!originPort || !destinationPort) {
      return res.status(404).json({ error: "One or more ports not found" });
    }

    if (!originPort.latitude || !originPort.longitude || 
        !destinationPort.latitude || !destinationPort.longitude) {
      return res.status(400).json({ error: "Ports must have coordinates" });
    }

    // Check if ship already has an active journey
    const activeJourney = await prisma.journey.findFirst({
      where: {
        shipId,
        status: { in: ['planned', 'in_progress'] },
        isActive: true
      }
    });

    if (activeJourney) {
      return res.status(400).json({ error: "Ship already has an active journey" });
    }

    // Calculate distance and estimated arrival
    const distance = calculateDistance(
      originPort.latitude, originPort.longitude,
      destinationPort.latitude, destinationPort.longitude
    );

    const travelTimeHours = distance / speed; // speed in knots
    const estimatedArrival = new Date(new Date(departureTime).getTime() + travelTimeHours * 60 * 60 * 1000);

    // Create journey
    const journey = await prisma.journey.create({
      data: {
        shipId,
        originPortId,
        destinationPortId,
        departureTime: new Date(departureTime),
        estimatedArrival,
        distance,
        speed,
        status: 'planned'
      },
      include: {
        ship: true,
        originPort: true,
        destinationPort: true,
        waypoints: true
      }
    });

    // Update ship position to origin port
    await prisma.ship.update({
      where: { id: shipId },
      data: {
        currentLatitude: originPort.latitude,
        currentLongitude: originPort.longitude,
        lastPositionUpdate: new Date()
      }
    });

    res.status(201).json({ data: journey });
  } catch (error) {
    console.error("Error creating journey:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Start a journey
export const startJourney = async (req, res) => {
  try {
    const { id } = req.params;

    const journey = await prisma.journey.findUnique({
      where: { id: parseInt(id) },
      include: { ship: true, originPort: true, destinationPort: true }
    });

    if (!journey) {
      return res.status(404).json({ error: "Journey not found" });
    }

    if (journey.status !== 'planned') {
      return res.status(400).json({ error: "Journey must be in planned status to start" });
    }

    // Update journey status
    const updatedJourney = await prisma.journey.update({
      where: { id: parseInt(id) },
      data: {
        status: 'in_progress',
        departureTime: new Date()
      },
      include: {
        ship: true,
        originPort: true,
        destinationPort: true,
        waypoints: { orderBy: { order: 'asc' } }
      }
    });

    res.json({ data: updatedJourney });
  } catch (error) {
    console.error("Error starting journey:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all journeys with filters
export const getJourneys = async (req, res) => {
  try {
    const { status, shipId, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const journeys = await prisma.journey.findMany({
      where: {
        status: status || undefined,
        shipId: shipId ? parseInt(shipId) : undefined,
        isActive: true
      },
      include: {
        ship: true,
        originPort: { select: { id: true, name: true, country: true, latitude: true, longitude: true } },
        destinationPort: { select: { id: true, name: true, country: true, latitude: true, longitude: true } },
        waypoints: { orderBy: { order: 'asc' } },
        positions: { 
          orderBy: { timestamp: 'desc' },
          take: 1 // Latest position only
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.journey.count({
      where: {
        status: status || undefined,
        shipId: shipId ? parseInt(shipId) : undefined,
        isActive: true
      }
    });

    res.json({
      data: journeys,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (error) {
    console.error("Error fetching journeys:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get journey by ID
export const getJourneyById = async (req, res) => {
  try {
    const { id } = req.params;

    const journey = await prisma.journey.findUnique({
      where: { id: parseInt(id) },
      include: {
        ship: true,
        originPort: true,
        destinationPort: true,
        waypoints: { orderBy: { order: 'asc' } },
        positions: { 
          orderBy: { timestamp: 'desc' },
          take: 100 // Last 100 positions for tracking
        },
        shipments: {
          include: {
            cargo: { include: { client: true } }
          }
        }
      }
    });

    if (!journey) {
      return res.status(404).json({ error: "Journey not found" });
    }

    res.json({ data: journey });
  } catch (error) {
    console.error("Error fetching journey:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update ship position (for real-time tracking)
export const updateShipPosition = async (req, res) => {
  try {
    const { shipId } = req.params;
    const { latitude, longitude, speed, heading } = req.body;

    // Find active journey for this ship
    const activeJourney = await prisma.journey.findFirst({
      where: {
        shipId: parseInt(shipId),
        status: 'in_progress',
        isActive: true
      },
      include: {
        originPort: true,
        destinationPort: true
      }
    });

    // Create position record
    const position = await prisma.shipPosition.create({
      data: {
        shipId: parseInt(shipId),
        journeyId: activeJourney?.id,
        latitude,
        longitude,
        speed,
        heading,
        timestamp: new Date()
      }
    });

    // Update ship's current position
    await prisma.ship.update({
      where: { id: parseInt(shipId) },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastPositionUpdate: new Date()
      }
    });

    // Calculate progress if there's an active journey
    if (activeJourney) {
      const totalDistance = calculateDistance(
        activeJourney.originPort.latitude,
        activeJourney.originPort.longitude,
        activeJourney.destinationPort.latitude,
        activeJourney.destinationPort.longitude
      );

      const distanceFromOrigin = calculateDistance(
        activeJourney.originPort.latitude,
        activeJourney.originPort.longitude,
        latitude,
        longitude
      );

      const progress = Math.min((distanceFromOrigin / totalDistance) * 100, 100);

      // Update journey progress
      await prisma.journey.update({
        where: { id: activeJourney.id },
        data: { progress }
      });

      // Check if ship has reached destination (within 1 nautical mile)
      const distanceToDestination = calculateDistance(
        latitude, longitude,
        activeJourney.destinationPort.latitude,
        activeJourney.destinationPort.longitude
      );

      if (distanceToDestination < 1 && activeJourney.status === 'in_progress') {
        await prisma.journey.update({
          where: { id: activeJourney.id },
          data: {
            status: 'completed',
            actualArrival: new Date(),
            progress: 100
          }
        });
      }
    }

    res.json({ data: position });
  } catch (error) {
    console.error("Error updating ship position:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get real-time ship positions
export const getActiveShipPositions = async (req, res) => {
  try {
    const activeJourneys = await prisma.journey.findMany({
      where: {
        status: 'in_progress',
        isActive: true
      },
      include: {
        ship: true,
        originPort: { select: { name: true, latitude: true, longitude: true } },
        destinationPort: { select: { name: true, latitude: true, longitude: true } },
        positions: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    const shipPositions = activeJourneys.map(journey => ({
      journeyId: journey.id,
      ship: journey.ship,
      progress: journey.progress,
      route: {
        origin: journey.originPort,
        destination: journey.destinationPort
      },
      currentPosition: journey.positions[0] || null,
      status: journey.status,
      estimatedArrival: journey.estimatedArrival
    }));

    res.json({ data: shipPositions });
  } catch (error) {
    console.error("Error fetching ship positions:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Cancel journey
export const cancelJourney = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const journey = await prisma.journey.update({
      where: { id: parseInt(id) },
      data: {
        status: 'cancelled',
        // You could add a reason field to the schema if needed
      }
    });

    res.json({ data: journey });
  } catch (error) {
    console.error("Error cancelling journey:", error);
    res.status(500).json({ error: error.message });
  }
};