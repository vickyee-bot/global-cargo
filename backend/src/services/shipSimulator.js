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

// Calculate new position based on current position, bearing, and distance
function calculateNewPosition(lat, lon, bearing, distance) {
  const R = 3440.065; // Earth radius in nautical miles
  const bearingRad = bearing * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(distance / R) +
    Math.cos(latRad) * Math.sin(distance / R) * Math.cos(bearingRad)
  );

  const newLonRad = lonRad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(latRad),
    Math.cos(distance / R) - Math.sin(latRad) * Math.sin(newLatRad)
  );

  return {
    latitude: newLatRad * 180 / Math.PI,
    longitude: newLonRad * 180 / Math.PI
  };
}

// Ship Movement Simulator Class
class ShipMovementSimulator {
  constructor() {
    this.activeSimulations = new Map();
    this.isRunning = false;
  }

  // Start simulation for all active journeys
  async startSimulation() {
    if (this.isRunning) return;
    
    console.log("🚢 Starting ship movement simulation...");
    this.isRunning = true;
    
    // Run simulation every 30 seconds
    this.simulationInterval = setInterval(() => {
      this.updateAllShipPositions();
    }, 30000);
    
    // Initial update
    await this.updateAllShipPositions();
  }

  // Stop simulation
  stopSimulation() {
    if (!this.isRunning) return;
    
    console.log("⏹️ Stopping ship movement simulation...");
    this.isRunning = false;
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    
    this.activeSimulations.clear();
  }

  // Update positions for all ships in active journeys
  async updateAllShipPositions() {
    try {
      // Get all in-progress journeys
      const activeJourneys = await prisma.journey.findMany({
        where: {
          status: 'in_progress',
          isActive: true
        },
        include: {
          ship: true,
          originPort: true,
          destinationPort: true,
          positions: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      });

      for (const journey of activeJourneys) {
        await this.updateShipPosition(journey);
      }
      
      if (activeJourneys.length > 0) {
        console.log(`📍 Updated positions for ${activeJourneys.length} ships`);
      }
    } catch (error) {
      console.error("Error updating ship positions:", error);
    }
  }

  // Update position for a single ship
  async updateShipPosition(journey) {
    try {
      const { ship, originPort, destinationPort, positions } = journey;
      
      // Skip if ports don't have coordinates
      if (!originPort.latitude || !originPort.longitude ||
          !destinationPort.latitude || !destinationPort.longitude) {
        return;
      }

      // Get current position (last recorded or ship's current position)
      let currentLat, currentLon;
      
      if (positions.length > 0) {
        currentLat = positions[0].latitude;
        currentLon = positions[0].longitude;
      } else {
        currentLat = ship.currentLatitude || originPort.latitude;
        currentLon = ship.currentLongitude || originPort.longitude;
      }

      // Calculate bearing and distance to destination
      const bearing = calculateBearing(
        currentLat, currentLon,
        destinationPort.latitude, destinationPort.longitude
      );

      const remainingDistance = calculateDistance(
        currentLat, currentLon,
        destinationPort.latitude, destinationPort.longitude
      );

      // Ship has reached destination (within 1 nautical mile)
      if (remainingDistance < 1) {
        await this.completeJourney(journey.id);
        return;
      }

      // Calculate movement based on ship speed (default 12 knots)
      const speed = journey.speed || 12;
      const timeInterval = 0.5; // 30 minutes in hours
      const distanceToMove = speed * timeInterval; // Distance in nautical miles

      // Don't move more than the remaining distance
      const actualDistanceToMove = Math.min(distanceToMove, remainingDistance - 0.1);

      // Calculate new position
      const newPosition = calculateNewPosition(
        currentLat, currentLon,
        bearing, actualDistanceToMove
      );

      // Add some randomness for realistic movement (wind, currents, etc.)
      const randomFactor = 0.01; // Small random variation
      newPosition.latitude += (Math.random() - 0.5) * randomFactor;
      newPosition.longitude += (Math.random() - 0.5) * randomFactor;

      // Create new position record
      await prisma.shipPosition.create({
        data: {
          shipId: ship.id,
          journeyId: journey.id,
          latitude: newPosition.latitude,
          longitude: newPosition.longitude,
          speed: speed + (Math.random() - 0.5) * 2, // Add speed variation
          heading: bearing,
          timestamp: new Date()
        }
      });

      // Update ship's current position
      await prisma.ship.update({
        where: { id: ship.id },
        data: {
          currentLatitude: newPosition.latitude,
          currentLongitude: newPosition.longitude,
          lastPositionUpdate: new Date()
        }
      });

      // Update journey progress
      const totalDistance = calculateDistance(
        originPort.latitude, originPort.longitude,
        destinationPort.latitude, destinationPort.longitude
      );

      const distanceFromOrigin = calculateDistance(
        originPort.latitude, originPort.longitude,
        newPosition.latitude, newPosition.longitude
      );

      const progress = Math.min((distanceFromOrigin / totalDistance) * 100, 100);

      await prisma.journey.update({
        where: { id: journey.id },
        data: { progress }
      });

    } catch (error) {
      console.error(`Error updating position for ship ${journey.ship.id}:`, error);
    }
  }

  // Complete a journey when ship reaches destination
  async completeJourney(journeyId) {
    try {
      await prisma.journey.update({
        where: { id: journeyId },
        data: {
          status: 'completed',
          actualArrival: new Date(),
          progress: 100
        }
      });

      console.log(`🎯 Journey ${journeyId} completed!`);
    } catch (error) {
      console.error(`Error completing journey ${journeyId}:`, error);
    }
  }

  // Get simulation status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeSimulations: this.activeSimulations.size
    };
  }
}

// Export singleton instance
const shipSimulator = new ShipMovementSimulator();

// Auto-start simulation when module loads
if (process.env.NODE_ENV !== 'test') {
  setTimeout(() => {
    shipSimulator.startSimulation();
  }, 5000); // Start after 5 seconds to allow app initialization
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down ship simulator...');
  shipSimulator.stopSimulation();
  process.exit(0);
});

export default shipSimulator;