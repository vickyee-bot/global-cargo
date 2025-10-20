import prisma from "../prisma.js";

// ✅ Create Shipment
export const createShipment = async (req, res) => {
  try {
    const {
      cargo_id,
      ship_id,
      origin_port_id,
      destination_port_id,
      departure_date,
      arrival_estimate,
    } = req.body;

    if (
      !cargo_id ||
      !ship_id ||
      !origin_port_id ||
      !destination_port_id ||
      !departure_date
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cargo = await prisma.cargo.findUnique({
      where: { id: parseInt(cargo_id) },
    });
    if (!cargo || !cargo.isActive)
      return res.status(400).json({ error: "Cargo not found or inactive" });

    const ship = await prisma.ship.findUnique({
      where: { id: parseInt(ship_id) },
    });
    if (!ship || !ship.isActive)
      return res.status(400).json({ error: "Ship not found or inactive" });

    // Validate capacity
    if (parseFloat(ship.capacityInTonnes) < parseFloat(cargo.weight)) {
      return res
        .status(400)
        .json({ error: "Ship capacity is insufficient for cargo weight" });
    }

    const shipment = await prisma.shipment.create({
      data: {
        cargoId: parseInt(cargo_id),
        shipId: parseInt(ship_id),
        originPortId: parseInt(origin_port_id),
        destinationPortId: parseInt(destination_port_id),
        departureDate: new Date(departure_date),
        arrivalEstimate: arrival_estimate ? new Date(arrival_estimate) : null,
        status: "pending",
      },
    });

    res.status(201).json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Shipment Status
export const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const shipment = await prisma.shipment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });

    // Workflow rules
    if (
      status === "delivered" &&
      new Date() < new Date(shipment.departureDate)
    ) {
      return res
        .status(400)
        .json({ error: "Cannot mark as delivered before departure" });
    }
    if (status === "delayed" && !reason) {
      return res.status(400).json({ error: "Delay requires a reason" });
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: parseInt(id) },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    res.json(updatedShipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get All Shipments
export const getShipments = async (req, res) => {
  try {
    const {
      status,
      start_date,
      end_date,
      origin_port,
      destination_port,
      sort = "departureDate",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const shipments = await prisma.shipment.findMany({
      where: {
        status: status || undefined,
        AND: [
          start_date && end_date
            ? {
                departureDate: {
                  gte: new Date(start_date),
                  lte: new Date(end_date),
                },
              }
            : undefined,
          origin_port ? { originPortId: parseInt(origin_port) } : undefined,
          destination_port
            ? { destinationPortId: parseInt(destination_port) }
            : undefined,
        ],
      },
      include: {
        cargo: true,
        ship: true,
        originPort: true,
        destinationPort: true,
      },
      skip,
      take: parseInt(limit),
      orderBy: { [sort]: order === "desc" ? "desc" : "asc" },
    });

    const total = await prisma.shipment.count({
      where: {
        status: status || undefined,
        AND: [
          start_date && end_date
            ? {
                departureDate: {
                  gte: new Date(start_date),
                  lte: new Date(end_date),
                },
              }
            : undefined,
          origin_port ? { originPortId: parseInt(origin_port) } : undefined,
          destination_port
            ? { destinationPortId: parseInt(destination_port) }
            : undefined,
        ],
      },
    });

    res.json({
      data: shipments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Single Shipment by ID
export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { id: parseInt(id) },
      include: {
        cargo: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                emailAddress: true,
                phoneNumber: true,
              },
            },
          },
        },
        ship: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            capacityInTonnes: true,
            type: true,
            status: true,
          },
        },
        originPort: {
          select: {
            id: true,
            name: true,
            country: true,
            coordinates: true,
            operationalHours: true,
          },
        },
        destinationPort: {
          select: {
            id: true,
            name: true,
            country: true,
            coordinates: true,
            operationalHours: true,
          },
        },
      },
    });

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res.json({ data: shipment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update full shipment details
export const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cargo_id,
      ship_id,
      origin_port_id,
      destination_port_id,
      departure_date,
      arrival_estimate,
      actual_arrival_date,
    } = req.body;

    // Validate ship capacity if ship or cargo changes
    if (ship_id || cargo_id) {
      const currentShipment = await prisma.shipment.findUnique({
        where: { id: parseInt(id) },
        include: { cargo: true, ship: true },
      });

      const shipId = ship_id ? parseInt(ship_id) : currentShipment.shipId;
      const cargoId = cargo_id ? parseInt(cargo_id) : currentShipment.cargoId;

      const ship = await prisma.ship.findUnique({ where: { id: shipId } });
      const cargo = await prisma.cargo.findUnique({ where: { id: cargoId } });

      if (ship && cargo && parseFloat(ship.capacityInTonnes) < parseFloat(cargo.weight)) {
        return res
          .status(400)
          .json({ error: "Ship capacity is insufficient for cargo weight" });
      }
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: parseInt(id) },
      data: {
        ...(cargo_id && { cargoId: parseInt(cargo_id) }),
        ...(ship_id && { shipId: parseInt(ship_id) }),
        ...(origin_port_id && { originPortId: parseInt(origin_port_id) }),
        ...(destination_port_id && { destinationPortId: parseInt(destination_port_id) }),
        ...(departure_date && { departureDate: new Date(departure_date) }),
        ...(arrival_estimate && { arrivalEstimate: new Date(arrival_estimate) }),
        ...(actual_arrival_date && { actualArrivalDate: new Date(actual_arrival_date) }),
      },
    });

    res.json(updatedShipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get shipments timeline view
export const getShipmentsTimeline = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(days));

    const shipments = await prisma.shipment.findMany({
      where: {
        OR: [
          {
            departureDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            arrivalEstimate: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
        isActive: true,
      },
      include: {
        ship: { select: { name: true } },
        cargo: { select: { description: true, cargoType: true } },
        originPort: { select: { name: true, country: true } },
        destinationPort: { select: { name: true, country: true } },
      },
      orderBy: { departureDate: "asc" },
    });

    const timelineData = shipments.map(shipment => ({
      id: shipment.id,
      title: `${shipment.ship?.name} - ${shipment.cargo?.description || 'Cargo'}`,
      status: shipment.status,
      departure: shipment.departureDate,
      arrival: shipment.arrivalEstimate,
      route: `${shipment.originPort?.name}, ${shipment.originPort?.country} → ${shipment.destinationPort?.name}, ${shipment.destinationPort?.country}`,
      cargoType: shipment.cargo?.cargoType,
      priority: shipment.cargo?.cargoType === 'perishable' ? 'high' : 
                shipment.cargo?.cargoType === 'dangerous' ? 'high' : 'normal'
    }));

    res.json({ data: timelineData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Cancel Shipment with notifications
export const cancelShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason)
      return res.status(400).json({ error: "Cancellation requires a reason" });

    // Get shipment with related data for notifications
    const shipment = await prisma.shipment.findUnique({
      where: { id: parseInt(id) },
      include: {
        cargo: {
          include: {
            client: { select: { firstName: true, lastName: true, emailAddress: true } }
          }
        },
        ship: { select: { name: true } },
        originPort: { select: { name: true, country: true } },
        destinationPort: { select: { name: true, country: true } }
      }
    });

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: parseInt(id) },
      data: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    });

    // Mock notification (in production, this would send emails/SMS)
    console.log(`📧 Notification: Shipment ${id} cancelled - Client: ${shipment.cargo?.client?.firstName} ${shipment.cargo?.client?.lastName}, Ship: ${shipment.ship?.name}`);
    console.log(`📧 Reason: ${reason}`);

    res.json({ 
      message: "Shipment cancelled successfully", 
      reason, 
      shipment: updatedShipment,
      notificationsSent: {
        client: shipment.cargo?.client?.emailAddress || 'No email',
        crew: `Ship ${shipment.ship?.name} crew notified`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get shipment statistics
export const getShipmentStats = async (req, res) => {
  try {
    const totalShipments = await prisma.shipment.count({ where: { isActive: true } });
    
    const shipmentsByStatus = await prisma.shipment.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { isActive: true }
    });

    const delayedShipments = shipmentsByStatus.find(s => s.status === 'delayed')?._count.id || 0;
    const deliveredShipments = shipmentsByStatus.find(s => s.status === 'delivered')?._count.id || 0;
    
    const onTimeRate = totalShipments > 0 ? 
      Math.round(((totalShipments - delayedShipments) / totalShipments) * 100) : 100;

    const avgDeliveryTime = await getAverageDeliveryTime();

    res.json({
      data: {
        totalShipments,
        deliveredShipments,
        delayedShipments,
        onTimeRate,
        avgDeliveryTime,
        shipmentsByStatus: shipmentsByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        }))
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate average delivery time
async function getAverageDeliveryTime() {
  const deliveredShipments = await prisma.shipment.findMany({
    where: {
      status: 'delivered',
      departureDate: { not: null },
      actualArrivalDate: { not: null }
    },
    select: {
      departureDate: true,
      actualArrivalDate: true
    }
  });

  if (deliveredShipments.length === 0) return 0;

  const totalDays = deliveredShipments.reduce((sum, shipment) => {
    const departure = new Date(shipment.departureDate);
    const arrival = new Date(shipment.actualArrivalDate);
    const days = (arrival - departure) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);

  return Math.round(totalDays / deliveredShipments.length);
}
