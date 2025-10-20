import prisma from "../prisma.js";

// ✅ Add a new ship
export const createShip = async (req, res) => {
  try {
    const { name, registration_number, capacity_in_tonnes, type, status } =
      req.body;

    // Check for unique registration number
    const existing = await prisma.ship.findUnique({
      where: { registrationNumber: registration_number },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Registration number must be unique" });
    }

    const ship = await prisma.ship.create({
      data: {
        name,
        registrationNumber: registration_number,
        capacityInTonnes: capacity_in_tonnes ? parseFloat(capacity_in_tonnes) : null,
        type: type || "cargo_ship",
        status: status || "active",
      },
    });

    res.status(201).json({ data: ship });
  } catch (error) {
    console.error("Error creating ship:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update ship details
export const updateShip = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, registration_number, capacity_in_tonnes, type, status } =
      req.body;

    // Check uniqueness if registration_number is changed
    if (registration_number) {
      const existing = await prisma.ship.findUnique({
        where: { registrationNumber: registration_number },
      });
      if (existing && existing.id !== parseInt(id)) {
        return res
          .status(400)
          .json({ error: "Registration number already in use" });
      }
    }

    // Prepare update data, filtering out undefined values
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (registration_number !== undefined) updateData.registrationNumber = registration_number;
    if (capacity_in_tonnes !== undefined) updateData.capacityInTonnes = parseFloat(capacity_in_tonnes);
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;

    const ship = await prisma.ship.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json({ data: ship });
  } catch (error) {
    console.error("Error updating ship:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get a single ship by ID
export const getShipById = async (req, res) => {
  try {
    const { id } = req.params;

    const ship = await prisma.ship.findUnique({
      where: { id: parseInt(id) },
      include: {
        crew: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        shipments: {
          where: { isActive: true },
          select: {
            id: true,
            status: true,
            departureDate: true,
            arrivalEstimate: true,
            originPort: {
              select: { name: true, country: true },
            },
            destinationPort: {
              select: { name: true, country: true },
            },
          },
        },
      },
    });

    if (!ship) {
      return res.status(404).json({ error: "Ship not found" });
    }

    res.json({ data: ship });
  } catch (error) {
    console.error("Error fetching ship:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all ships with filters & pagination
export const getShips = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 100 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ships = await prisma.ship.findMany({
      where: {
        type: type || undefined,
        status: status || undefined,
        isActive: true,
      },
      include: {
        crew: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        shipments: {
          where: { isActive: true },
          select: {
            id: true,
            status: true,
            departureDate: true,
            arrivalEstimate: true,
          },
        },
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.ship.count({
      where: {
        type: type || undefined,
        status: status || undefined,
        isActive: true,
      },
    });

    res.json({
      data: ships,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching ships:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Decommission a ship (soft delete)
export const decommissionShip = async (req, res) => {
  try {
    const { id } = req.params;

    const ship = await prisma.ship.update({
      where: { id: parseInt(id) },
      data: { isActive: false, status: "decommissioned" },
    });

    res.json({ message: "Ship decommissioned successfully", ship });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
