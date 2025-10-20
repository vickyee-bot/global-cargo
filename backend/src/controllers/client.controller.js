import prisma from "../prisma.js";

// ✅ Create Client
export const createClient = async (req, res) => {
  try {
    const { first_name, last_name, email_address, phone_number, address } = req.body;

    if (!first_name || !last_name) {
      return res
        .status(400)
        .json({ error: "First name and last name are required" });
    }

    // If email provided, check uniqueness
    if (email_address) {
      const existingEmail = await prisma.client.findUnique({
        where: { emailAddress: email_address },
      });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    const client = await prisma.client.create({
      data: {
        firstName: first_name,
        lastName: last_name,
        emailAddress: email_address || null,
        phoneNumber: phone_number || null,
        address: address || null,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email_address, phone_number, address } = req.body;

    if (email_address) {
      // Check email uniqueness if changed
      const existingEmail = await prisma.client.findUnique({
        where: { emailAddress: email_address },
      });
      if (existingEmail && existingEmail.id !== parseInt(id)) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        ...(first_name && { firstName: first_name }),
        ...(last_name && { lastName: last_name }),
        ...(email_address !== undefined && { emailAddress: email_address }),
        ...(phone_number !== undefined && { phoneNumber: phone_number }),
        ...(address !== undefined && { address }),
      },
    });

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all Clients with search & filter
export const getClients = async (req, res) => {
  try {
    const {
      search,
      status,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const clients = await prisma.client.findMany({
      where: {
        isActive:
          status === "inactive"
            ? false
            : status === "active"
            ? true
            : undefined,
        OR: search
          ? [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      skip,
      take: parseInt(limit),
      orderBy: { [sort]: order === "desc" ? "desc" : "asc" },
    });

    const total = await prisma.client.count({
      where: {
        isActive:
          status === "inactive"
            ? false
            : status === "active"
            ? true
            : undefined,
        OR: search
          ? [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
    });

    res.json({
      data: clients,
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

// ✅ Get Single Client by ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        cargo: {
          where: { isActive: true },
          select: {
            id: true,
            description: true,
            weight: true,
            volume: true,
            cargoType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({ data: client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Deactivate Client (preserves historical data)
export const deactivateClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({ message: "Client deactivated successfully", client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Reactivate Client
export const reactivateClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
    });

    res.json({ message: "Client reactivated successfully", client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Client Statistics
export const getClientStats = async (req, res) => {
  try {
    const totalClients = await prisma.client.count({ where: { isActive: true } });
    const inactiveClients = await prisma.client.count({ where: { isActive: false } });
    const clientsWithCargo = await prisma.client.count({
      where: {
        isActive: true,
        cargo: {
          some: { isActive: true }
        }
      }
    });

    res.json({
      data: {
        totalClients,
        activeClients: totalClients,
        inactiveClients,
        clientsWithCargo,
        utilizationRate: totalClients > 0 ? Math.round((clientsWithCargo / totalClients) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
