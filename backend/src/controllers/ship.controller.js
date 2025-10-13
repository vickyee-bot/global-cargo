import prisma from "../prisma.js";

// ✅ Add a new ship
export const createShip = async (req, res) => {
  try {
    const { name, registration_number, capacity_in_tonnes, type, status } =
      req.body;

    // Check for unique registration number
    const existing = await prisma.ship.findUnique({
      where: { registrationNo: registration_number },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Registration number must be unique" });
    }

    const ship = await prisma.ship.create({
      data: {
        name,
        registrationNo: registration_number,
        capacityInTonnes: capacity_in_tonnes,
        type: type || "cargo_ship",
        status: status || "active",
      },
    });

    res.status(201).json(ship);
  } catch (error) {
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
        where: { registrationNo: registration_number },
      });
      if (existing && existing.id !== parseInt(id)) {
        return res
          .status(400)
          .json({ error: "Registration number already in use" });
      }
    }

    const ship = await prisma.ship.update({
      where: { id: parseInt(id) },
      data: {
        name,
        registrationNo: registration_number,
        capacityInTonnes: capacity_in_tonnes,
        type,
        status,
      },
    });

    res.json(ship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all ships with filters & pagination
export const getShips = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ships = await prisma.ship.findMany({
      where: {
        type: type || undefined,
        status: status || undefined,
        isActive: true,
      },
      skip,
      take: parseInt(limit),
      orderBy: { capacityInTonnes: "desc" },
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
