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

// ✅ Deactivate crew member
export const deactivateCrewMember = async (req, res) => {
  try {
    const { id } = req.params;

    const crew = await prisma.crew.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({ message: "Crew member deactivated successfully", crew });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
