import prisma from "../prisma.js";

// ✅ Validate Lat/Long format
const isValidCoordinates = (coords) => {
  const regex = /^-?\d{1,3}\.\d+,-?\d{1,3}\.\d+$/;
  return regex.test(coords);
};

// ✅ Create Port
export const createPort = async (req, res) => {
  try {
    const {
      name,
      country,
      coordinates,
      docking_capacity,
      customs_authorized,
      port_type,
    } = req.body;

    if (!name || !country || !coordinates) {
      return res
        .status(400)
        .json({ error: "Name, country, and coordinates are required" });
    }

    if (!isValidCoordinates(coordinates)) {
      return res
        .status(400)
        .json({
          error: "Invalid coordinates format. Use 'latitude,longitude'",
        });
    }

    // Check uniqueness per country
    const existing = await prisma.port.findFirst({
      where: { name, country },
    });
    if (existing)
      return res
        .status(400)
        .json({ error: "Port name already exists in this country" });

    const port = await prisma.port.create({
      data: {
        name,
        country,
        coordinates,
        portType: port_type || null,
        dockingCapacity: docking_capacity || null,
        customsAuthorized: customs_authorized || false,
      },
    });

    res.status(201).json(port);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Port
export const updatePort = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      country,
      coordinates,
      docking_capacity,
      customs_authorized,
      port_type,
    } = req.body;

    if (coordinates && !isValidCoordinates(coordinates)) {
      return res.status(400).json({ error: "Invalid coordinates format" });
    }

    const port = await prisma.port.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(country && { country }),
        ...(coordinates && { coordinates }),
        ...(port_type && { portType: port_type }),
        ...(docking_capacity && { dockingCapacity: docking_capacity }),
        ...(customs_authorized !== undefined && {
          customsAuthorized: customs_authorized,
        }),
      },
    });

    res.json(port);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all ports with filters
export const getPorts = async (req, res) => {
  try {
    const {
      country,
      port_type,
      customs_authorized,
      sort = "name",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ports = await prisma.port.findMany({
      where: {
        country: country || undefined,
        portType: port_type || undefined,
        customsAuthorized: customs_authorized
          ? customs_authorized === "true"
          : undefined,
      },
      skip,
      take: parseInt(limit),
      orderBy: { [sort]: order === "desc" ? "desc" : "asc" },
    });

    const total = await prisma.port.count();

    res.json({
      data: ports,
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

// ✅ Archive Port
export const archivePort = async (req, res) => {
  try {
    const { id } = req.params;

    const port = await prisma.port.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({ message: "Port archived successfully", port });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
