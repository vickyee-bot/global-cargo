import prisma from "../prisma.js";

// ✅ Create Cargo
export const createCargo = async (req, res) => {
  try {
    const { description, weight, client_id, volume, cargo_type } = req.body;

    if (!description || !weight || !client_id) {
      return res
        .status(400)
        .json({ error: "Description, weight, and client_id are required" });
    }

    if (weight <= 0) {
      return res.status(400).json({ error: "Weight must be greater than 0" });
    }

    // Validate client exists
    const client = await prisma.client.findUnique({
      where: { id: parseInt(client_id) },
    });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const cargo = await prisma.cargo.create({
      data: {
        description,
        weight,
        clientId: parseInt(client_id),
        volume: volume || null,
        cargoType: cargo_type || "general",
      },
    });

    res.status(201).json(cargo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Cargo
export const updateCargo = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, weight, client_id, volume, cargo_type } = req.body;

    if (weight && weight <= 0) {
      return res.status(400).json({ error: "Weight must be greater than 0" });
    }

    // If cargo_type changes to 'dangerous', trigger warning (for now just respond)
    if (cargo_type && cargo_type === "dangerous") {
      console.log("⚠ Safety protocol required for dangerous cargo");
    }

    const updatedCargo = await prisma.cargo.update({
      where: { id: parseInt(id) },
      data: {
        ...(description && { description }),
        ...(weight && { weight }),
        ...(volume && { volume }),
        ...(cargo_type && { cargoType: cargo_type }),
        ...(client_id && { clientId: parseInt(client_id) }),
      },
    });

    res.json(updatedCargo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all Cargo with filters
export const getCargo = async (req, res) => {
  try {
    const {
      client_id,
      cargo_type,
      status,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const cargo = await prisma.cargo.findMany({
      where: {
        clientId: client_id ? parseInt(client_id) : undefined,
        cargoType: cargo_type || undefined,
        isActive:
          status === "inactive"
            ? false
            : status === "active"
            ? true
            : undefined,
      },
      skip,
      take: parseInt(limit),
      orderBy: { [sort]: order === "desc" ? "desc" : "asc" },
      include: { client: true },
    });

    const total = await prisma.cargo.count();

    res.json({
      data: cargo,
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

// ✅ Deactivate Cargo
export const deactivateCargo = async (req, res) => {
  try {
    const { id } = req.params;

    const cargo = await prisma.cargo.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({ message: "Cargo deactivated successfully", cargo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
