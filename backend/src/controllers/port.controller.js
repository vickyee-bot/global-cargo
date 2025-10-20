import prisma from "../prisma.js";

// ✅ Validate Lat/Long format
const isValidCoordinates = (coords) => {
  const regex = /^-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?$/;
  if (!regex.test(coords)) return false;
  
  const [lat, lng] = coords.split(',').map(parseFloat);
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// ✅ Check if port capacity meets ship requirements
const validatePortCapacity = async (portId, shipId) => {
  const port = await prisma.port.findUnique({ where: { id: portId } });
  const ship = await prisma.ship.findUnique({ where: { id: shipId } });
  
  if (!port || !ship) return { valid: false, message: "Port or ship not found" };
  
  if (port.maxVesselSize && ship.capacityInTonnes > port.maxVesselSize) {
    return { 
      valid: false, 
      message: `Port capacity (${port.maxVesselSize}T) insufficient for ship (${ship.capacityInTonnes}T)`
    };
  }
  
  return { valid: true };
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
      return res.status(400).json({ 
        error: "Invalid coordinates format. Use 'latitude,longitude' (e.g., '40.7128,-74.0060')" 
      });
    }

    // Warn if capacity is being reduced below largest ship's requirements
    if (docking_capacity) {
      const largestShip = await prisma.ship.findFirst({
        where: { isActive: true },
        orderBy: { capacityInTonnes: 'desc' }
      });
      
      if (largestShip && docking_capacity < largestShip.capacityInTonnes) {
        console.warn(`⚠ Warning: Port capacity (${docking_capacity}T) is below largest ship requirement (${largestShip.capacityInTonnes}T)`);
      }
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
        isActive: true, // Only show active ports
      },
      skip,
      take: parseInt(limit),
      orderBy: { [sort]: order === "desc" ? "desc" : "asc" },
    });

    const total = await prisma.port.count({
      where: {
        country: country || undefined,
        portType: port_type || undefined,
        customsAuthorized: customs_authorized
          ? customs_authorized === "true"
          : undefined,
        isActive: true,
      },
    });

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

// ✅ Get Single Port by ID
export const getPortById = async (req, res) => {
  try {
    const { id } = req.params;

    const port = await prisma.port.findUnique({
      where: { id: parseInt(id) },
      include: {
        shipmentsOrigin: {
          where: { isActive: true },
          select: {
            id: true,
            status: true,
            departureDate: true,
            ship: { select: { name: true } },
            destinationPort: { select: { name: true, country: true } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        shipmentsDestination: {
          where: { isActive: true },
          select: {
            id: true,
            status: true,
            arrivalEstimate: true,
            ship: { select: { name: true } },
            originPort: { select: { name: true, country: true } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
      },
    });

    if (!port) {
      return res.status(404).json({ error: "Port not found" });
    }

    res.json({ data: port });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get ports with map view data
export const getPortsForMap = async (req, res) => {
  try {
    const { country, port_type } = req.query;

    const ports = await prisma.port.findMany({
      where: {
        country: country || undefined,
        portType: port_type || undefined,
        isActive: true,
        coordinates: { not: null }, // Only ports with coordinates
      },
      select: {
        id: true,
        name: true,
        country: true,
        coordinates: true,
        portType: true,
        dockingCapacity: true,
        customsAuthorized: true,
      },
      orderBy: { name: 'asc' },
    });

    // Transform coordinates for mapping
    const mapData = ports.map(port => {
      const [lat, lng] = port.coordinates ? port.coordinates.split(',').map(parseFloat) : [0, 0];
      return {
        ...port,
        latitude: lat,
        longitude: lng,
      };
    });

    res.json({ data: mapData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Archive Port (preserves historical shipment data)
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

// ✅ Reactivate archived port
export const reactivatePort = async (req, res) => {
  try {
    const { id } = req.params;

    const port = await prisma.port.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
    });

    res.json({ message: "Port reactivated successfully", port });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get port statistics
export const getPortStats = async (req, res) => {
  try {
    const totalPorts = await prisma.port.count({ where: { isActive: true } });
    const archivedPorts = await prisma.port.count({ where: { isActive: false } });
    
    const portsByCountry = await prisma.port.groupBy({
      by: ['country'],
      _count: { id: true },
      where: { isActive: true },
      orderBy: { _count: { id: 'desc' } }
    });

    const portsByType = await prisma.port.groupBy({
      by: ['portType'],
      _count: { id: true },
      where: { isActive: true }
    });

    const customsAuthorizedPorts = await prisma.port.count({
      where: { isActive: true, customsAuthorized: true }
    });

    const totalDockingCapacity = await prisma.port.aggregate({
      _sum: { dockingCapacity: true },
      where: { isActive: true }
    });

    res.json({
      data: {
        totalPorts,
        archivedPorts,
        customsAuthorizedPorts,
        totalDockingCapacity: totalDockingCapacity._sum.dockingCapacity || 0,
        portsByCountry: portsByCountry.map(item => ({
          country: item.country,
          count: item._count.id
        })),
        portsByType: portsByType.map(item => ({
          type: item.portType || 'Unknown',
          count: item._count.id
        }))
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Validate port capacity for ship
export const validateCapacityForShip = async (req, res) => {
  try {
    const { portId, shipId } = req.params;
    
    const validation = await validatePortCapacity(parseInt(portId), parseInt(shipId));
    
    res.json({
      valid: validation.valid,
      message: validation.message || 'Port capacity is suitable for this ship'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
