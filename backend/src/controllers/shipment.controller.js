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

    const total = await prisma.shipment.count();

    res.json({
      data: shipments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Cancel Shipment
export const cancelShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason)
      return res.status(400).json({ error: "Cancellation requires a reason" });

    const shipment = await prisma.shipment.update({
      where: { id: parseInt(id) },
      data: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    });

    res.json({ message: "Shipment cancelled successfully", reason, shipment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
