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

    // If cargo_type changes to 'dangerous', trigger safety protocol confirmation
    if (cargo_type && cargo_type === "dangerous") {
      const { safety_confirmed } = req.body;
      if (!safety_confirmed) {
        return res.status(400).json({
          error: "Safety protocol confirmation required for dangerous cargo",
          requiresSafetyConfirmation: true,
          message: "Please confirm safety protocols have been reviewed and approved."
        });
      }
      console.log("✅ Safety protocol confirmed for dangerous cargo update");
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

    const total = await prisma.cargo.count({
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
    });

    // Highlight dangerous cargo in the response
    const cargoWithHighlight = cargo.map(item => ({
      ...item,
      isDangerous: item.cargoType === 'dangerous',
      requiresSpecialHandling: ['dangerous', 'perishable'].includes(item.cargoType)
    }));

    res.json({
      data: cargoWithHighlight,
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

// ✅ Get Single Cargo by ID
export const getCargoById = async (req, res) => {
  try {
    const { id } = req.params;

    const cargo = await prisma.cargo.findUnique({
      where: { id: parseInt(id) },
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
        shipments: {
          where: { isActive: true },
          select: {
            id: true,
            status: true,
            departureDate: true,
            arrivalEstimate: true,
            ship: {
              select: { name: true }
            },
            originPort: {
              select: { name: true, country: true }
            },
            destinationPort: {
              select: { name: true, country: true }
            },
          },
        },
      },
    });

    if (!cargo) {
      return res.status(404).json({ error: "Cargo not found" });
    }

    res.json({ data: cargo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Deactivate Cargo (preserves shipment history)
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

// ✅ Reactivate Cargo
export const reactivateCargo = async (req, res) => {
  try {
    const { id } = req.params;

    const cargo = await prisma.cargo.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
    });

    res.json({ message: "Cargo reactivated successfully", cargo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Cargo Statistics
export const getCargoStats = async (req, res) => {
  try {
    const totalCargo = await prisma.cargo.count({ where: { isActive: true } });
    const cargoByType = await prisma.cargo.groupBy({
      by: ['cargoType'],
      _count: { id: true },
      where: { isActive: true }
    });
    
    const dangerousCargo = cargoByType.find(c => c.cargoType === 'dangerous')?._count.id || 0;
    const perishableCargo = cargoByType.find(c => c.cargoType === 'perishable')?._count.id || 0;
    
    const totalWeight = await prisma.cargo.aggregate({
      _sum: { weight: true },
      where: { isActive: true }
    });

    const totalVolume = await prisma.cargo.aggregate({
      _sum: { volume: true },
      where: { isActive: true }
    });

    res.json({
      data: {
        totalCargo,
        dangerousCargo,
        perishableCargo,
        specialHandlingRequired: dangerousCargo + perishableCargo,
        totalWeight: totalWeight._sum.weight || 0,
        totalVolume: totalVolume._sum.volume || 0,
        cargoByType: cargoByType.map(item => ({
          type: item.cargoType,
          count: item._count.id
        }))
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
