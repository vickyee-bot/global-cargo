import prisma from "../prisma.js";

// ✅ Add a new crew member
export const createCrewMember = async (req, res) => {
  try {
    const { first_name, last_name, role, phone_number, nationality, ship_id } =
      req.body;

    // Validate unique phone number
    const existing = await prisma.crew.findUnique({
      where: { phoneNumber: phone_number },
    });
    if (existing)
      return res.status(400).json({ error: "Phone number already exists" });

    // Validate only one Captain per ship
    if (role === "Captain" && ship_id) {
      const existingCaptain = await prisma.crew.findFirst({
        where: { shipId: ship_id, role: "Captain", isActive: true },
      });
      if (existingCaptain) {
        return res
          .status(400)
          .json({ error: "This ship already has an active Captain" });
      }
    }

    const crew = await prisma.crew.create({
      data: {
        firstName: first_name,
        lastName: last_name,
        role,
        phoneNumber: phone_number,
        nationality,
        shipId: ship_id || null,
      },
    });

    res.status(201).json(crew);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Edit crew member details
export const updateCrewMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, role, phone_number, nationality, ship_id } =
      req.body;

    const crew = await prisma.crew.findUnique({ where: { id: parseInt(id) } });
    if (!crew) return res.status(404).json({ error: "Crew member not found" });

    // Validate phone number uniqueness
    if (phone_number) {
      const existing = await prisma.crew.findUnique({
        where: { phoneNumber: phone_number },
      });
      if (existing && existing.id !== parseInt(id)) {
        return res.status(400).json({ error: "Phone number already in use" });
      }
    }

    // Validate only one Captain per ship
    if (role === "Captain" && ship_id) {
      const existingCaptain = await prisma.crew.findFirst({
        where: {
          shipId: ship_id,
          role: "Captain",
          isActive: true,
          NOT: { id: parseInt(id) },
        },
      });
      if (existingCaptain) {
        return res
          .status(400)
          .json({ error: "This ship already has an active Captain" });
      }
    }

    const normalizeRole = (role) => {
      if (!role) return undefined;
      return role.replace(" ", "_"); // Converts "Chief Officer" → "Chief_Officer"
    };

    const updatedCrew = await prisma.crew.update({
      where: { id: parseInt(id) },
      data: {
        firstName: first_name,
        lastName: last_name,
        role: normalizeRole(role),
        phoneNumber: phone_number,
        nationality,
        shipId: ship_id || null,
      },
    });

    res.json(updatedCrew);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View all crew members with filters & pagination
export const getCrewMembers = async (req, res) => {
  try {
    const { role, ship_id, is_active, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const crewMembers = await prisma.crew.findMany({
      where: {
        role: role || undefined,
        shipId: ship_id ? parseInt(ship_id) : undefined,
        isActive: is_active === "false" ? false : true,
      },
      skip,
      take: parseInt(limit),
      orderBy: { lastName: "asc" },
    });

    const total = await prisma.crew.count({
      where: {
        role: role || undefined,
        shipId: ship_id ? parseInt(ship_id) : undefined,
        isActive: is_active === "false" ? false : true,
      },
    });

    res.json({
      data: crewMembers,
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

// ✅ Get Single Crew Member by ID
export const getCrewMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const crewMember = await prisma.crew.findUnique({
      where: { id: parseInt(id) },
      include: {
        ship: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            status: true,
            type: true,
          },
        },
      },
    });

    if (!crewMember) {
      return res.status(404).json({ error: "Crew member not found" });
    }

    res.json({ data: crewMember });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Assign crew member to a ship
export const assignToShip = async (req, res) => {
  try {
    const { id } = req.params;
    const { ship_id } = req.body;

    if (!ship_id) {
      return res.status(400).json({ error: "Ship ID is required" });
    }

    // Get current crew member
    const crewMember = await prisma.crew.findUnique({
      where: { id: parseInt(id) },
    });

    if (!crewMember) {
      return res.status(404).json({ error: "Crew member not found" });
    }

    // Validate ship exists
    const ship = await prisma.ship.findUnique({
      where: { id: parseInt(ship_id), isActive: true },
    });

    if (!ship) {
      return res.status(404).json({ error: "Active ship not found" });
    }

    // Validate only one Captain per ship
    if (crewMember.role === "Captain") {
      const existingCaptain = await prisma.crew.findFirst({
        where: {
          shipId: parseInt(ship_id),
          role: "Captain",
          isActive: true,
          NOT: { id: parseInt(id) },
        },
      });
      if (existingCaptain) {
        return res
          .status(400)
          .json({ error: "This ship already has an active Captain" });
      }
    }

    const updatedCrew = await prisma.crew.update({
      where: { id: parseInt(id) },
      data: { shipId: parseInt(ship_id) },
    });

    res.json({ message: "Crew member assigned to ship successfully", crew: updatedCrew });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Unassign crew member from ship
export const unassignFromShip = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCrew = await prisma.crew.update({
      where: { id: parseInt(id) },
      data: { shipId: null },
    });

    res.json({ message: "Crew member unassigned from ship successfully", crew: updatedCrew });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Deactivate crew member (preserves historical records)
export const deactivateCrewMember = async (req, res) => {
  try {
    const { id } = req.params;

    const crew = await prisma.crew.update({
      where: { id: parseInt(id) },
      data: { isActive: false, shipId: null }, // Remove from active duty and ship assignment
    });

    res.json({ message: "Crew member deactivated successfully", crew });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Reactivate crew member
export const reactivateCrewMember = async (req, res) => {
  try {
    const { id } = req.params;

    const crew = await prisma.crew.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
    });

    res.json({ message: "Crew member reactivated successfully", crew });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get available crew members (not assigned to ships)
export const getAvailableCrew = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const availableCrew = await prisma.crew.findMany({
      where: {
        isActive: true,
        shipId: null, // Not assigned to any ship
        ...(role && { role }),
      },
      skip,
      take: parseInt(limit),
      orderBy: [{ role: "asc" }, { lastName: "asc" }],
    });

    const total = await prisma.crew.count({
      where: {
        isActive: true,
        shipId: null,
        ...(role && { role }),
      },
    });

    res.json({
      data: availableCrew,
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

// ✅ Get crew statistics
export const getCrewStats = async (req, res) => {
  try {
    const totalCrew = await prisma.crew.count({ where: { isActive: true } });
    const assignedCrew = await prisma.crew.count({
      where: { isActive: true, shipId: { not: null } },
    });
    const availableCrew = totalCrew - assignedCrew;

    const crewByRole = await prisma.crew.groupBy({
      by: ["role"],
      _count: { id: true },
      where: { isActive: true },
    });

    const crewByShip = await prisma.crew.groupBy({
      by: ["shipId"],
      _count: { id: true },
      where: { isActive: true, shipId: { not: null } },
    });

    res.json({
      data: {
        totalCrew,
        assignedCrew,
        availableCrew,
        utilizationRate: totalCrew > 0 ? Math.round((assignedCrew / totalCrew) * 100) : 0,
        crewByRole: crewByRole.map((item) => ({
          role: item.role.replace("_", " "),
          count: item._count.id,
        })),
        shipsWithCrew: crewByShip.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
