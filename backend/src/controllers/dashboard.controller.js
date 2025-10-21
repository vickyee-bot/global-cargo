import prisma from "../prisma.js";

// ✅ Get comprehensive dashboard data for real-time monitoring
export const getDashboardData = async (req, res) => {
  try {
    // Fetch all key metrics in parallel for better performance
    const [
      fleetStatus,
      shipmentStatus,
      operationalAlerts,
      activeRoutes,
      portOperations,
      crewStatus,
      recentActivity,
      kpiMetrics
    ] = await Promise.all([
      getFleetStatusData(),
      getShipmentStatusData(),
      getOperationalAlerts(),
      getActiveRoutes(),
      getPortOperations(),
      getCrewStatusData(),
      getRecentActivity(),
      getKPIMetrics()
    ]);

    res.json({
      data: {
        fleetStatus,
        shipmentStatus,
        operationalAlerts,
        activeRoutes,
        portOperations,
        crewStatus,
        recentActivity,
        kpiMetrics,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

// ✅ Get fleet status overview
async function getFleetStatusData() {
  const ships = await prisma.ship.findMany({
    where: { isActive: true },
    include: {
      shipments: {
        where: { 
          isActive: true,
          status: { in: ['pending', 'in_transit'] }
        },
        select: {
          id: true,
          status: true,
          departureDate: true,
          arrivalEstimate: true
        }
      },
      crew: {
        where: { isActive: true },
        select: { id: true, role: true }
      }
    }
  });

  const statusCount = ships.reduce((acc, ship) => {
    acc[ship.status] = (acc[ship.status] || 0) + 1;
    return acc;
  }, {});

  const activeShips = ships.filter(ship => ship.status === 'active').length;
  const shipsInTransit = ships.filter(ship => 
    ship.shipments.some(s => s.status === 'in_transit')
  ).length;

  return {
    totalShips: ships.length,
    activeShips,
    shipsInTransit,
    maintenanceShips: statusCount.under_maintenance || 0,
    utilizationRate: ships.length > 0 ? Math.round((activeShips / ships.length) * 100) : 0,
    statusDistribution: statusCount,
    shipsWithCargo: ships.filter(ship => ship.shipments.length > 0).length
  };
}

// ✅ Get shipment status overview
async function getShipmentStatusData() {
  const shipments = await prisma.shipment.findMany({
    where: { isActive: true },
    include: {
      ship: {
        select: { name: true, status: true }
      },
      cargo: {
        select: { description: true, cargoType: true, weight: true }
      },
      originPort: {
        select: { name: true, country: true }
      },
      destinationPort: {
        select: { name: true, country: true }
      }
    }
  });

  const statusCount = shipments.reduce((acc, shipment) => {
    acc[shipment.status] = (acc[shipment.status] || 0) + 1;
    return acc;
  }, {});

  const delayedShipments = shipments.filter(shipment => {
    if (shipment.status === 'delayed') return true;
    if (shipment.arrivalEstimate) {
      const now = new Date();
      const estimated = new Date(shipment.arrivalEstimate);
      return now > estimated && shipment.status === 'in_transit';
    }
    return false;
  });

  return {
    totalShipments: shipments.length,
    inTransit: statusCount.in_transit || 0,
    delivered: statusCount.delivered || 0,
    delayed: delayedShipments.length,
    pending: statusCount.pending || 0,
    onTimePerformance: shipments.length > 0 ? 
      Math.round(((shipments.length - delayedShipments.length) / shipments.length) * 100) : 100,
    statusDistribution: statusCount,
    recentShipments: shipments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        status: s.status,
        ship: s.ship?.name || 'Unassigned',
        route: s.originPort && s.destinationPort ? 
          `${s.originPort.name} → ${s.destinationPort.name}` : 'Route TBD',
        eta: s.arrivalEstimate,
        cargoType: s.cargo?.cargoType || 'general'
      }))
  };
}

// ✅ Get operational alerts
async function getOperationalAlerts() {
  const alerts = [];

  // Check for delayed shipments
  const delayedShipments = await prisma.shipment.count({
    where: { 
      status: 'delayed',
      isActive: true 
    }
  });

  if (delayedShipments > 0) {
    alerts.push({
      id: 'delayed-shipments',
      type: 'warning',
      title: 'Delayed Shipments',
      message: `${delayedShipments} shipments are currently delayed`,
      priority: delayedShipments > 5 ? 'high' : 'medium',
      action: 'Review and reschedule affected shipments',
      timestamp: new Date().toISOString()
    });
  }

  // Check for ships needing maintenance
  const maintenanceShips = await prisma.ship.count({
    where: { 
      status: 'under_maintenance',
      isActive: true 
    }
  });

  if (maintenanceShips > 0) {
    alerts.push({
      id: 'maintenance-ships',
      type: 'info',
      title: 'Ships Under Maintenance',
      message: `${maintenanceShips} ships are currently under maintenance`,
      priority: 'medium',
      action: 'Monitor maintenance completion schedules',
      timestamp: new Date().toISOString()
    });
  }

  // Check for unassigned crew
  const availableCrew = await prisma.crew.count({
    where: { 
      shipId: null,
      isActive: true 
    }
  });

  if (availableCrew < 10) {
    alerts.push({
      id: 'crew-shortage',
      type: 'warning',
      title: 'Low Crew Availability',
      message: `Only ${availableCrew} crew members available for assignment`,
      priority: availableCrew < 5 ? 'high' : 'medium',
      action: 'Consider recruiting additional crew members',
      timestamp: new Date().toISOString()
    });
  }

  // Check for cargo needing urgent handling
  const perishableCargo = await prisma.cargo.count({
    where: {
      cargoType: 'perishable',
      isActive: true,
      shipments: {
        some: {
          status: { in: ['pending', 'in_transit'] }
        }
      }
    }
  });

  if (perishableCargo > 0) {
    alerts.push({
      id: 'perishable-cargo',
      type: 'urgent',
      title: 'Perishable Cargo Alert',
      message: `${perishableCargo} perishable cargo items require priority handling`,
      priority: 'high',
      action: 'Fast-track perishable shipments',
      timestamp: new Date().toISOString()
    });
  }

  return alerts.sort((a, b) => {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// ✅ Get active routes information
async function getActiveRoutes() {
  const activeShipments = await prisma.shipment.findMany({
    where: {
      status: { in: ['in_transit', 'pending'] },
      isActive: true,
      originPort: { isNot: null },
      destinationPort: { isNot: null }
    },
    include: {
      originPort: {
        select: { name: true, country: true }
      },
      destinationPort: {
        select: { name: true, country: true }
      },
      ship: {
        select: { name: true }
      }
    },
    take: 10 // Most recent active routes
  });

  return activeShipments.map(shipment => ({
    id: shipment.id,
    route: `${shipment.originPort.name}, ${shipment.originPort.country} → ${shipment.destinationPort.name}, ${shipment.destinationPort.country}`,
    ship: shipment.ship?.name || 'Unassigned',
    status: shipment.status,
    departure: shipment.departureDate,
    eta: shipment.arrivalEstimate,
    progress: calculateRouteProgress(shipment.departureDate, shipment.arrivalEstimate)
  }));
}

// ✅ Get port operations summary
async function getPortOperations() {
  const portActivity = await prisma.port.findMany({
    include: {
      shipmentsOrigin: {
        where: {
          isActive: true,
          status: { in: ['pending', 'in_transit'] }
        }
      },
      shipmentsDestination: {
        where: {
          isActive: true,
          status: { in: ['in_transit', 'delivered'] }
        }
      }
    },
    orderBy: {
      name: 'asc'
    },
    take: 10
  });

  return portActivity
    .map(port => ({
      id: port.id,
      name: port.name,
      country: port.country,
      outgoingShipments: port.shipmentsOrigin.length,
      incomingShipments: port.shipmentsDestination.length,
      totalActivity: port.shipmentsOrigin.length + port.shipmentsDestination.length,
      operationalHours: port.operationalHours || '24/7'
    }))
    .filter(port => port.totalActivity > 0)
    .sort((a, b) => b.totalActivity - a.totalActivity);
}

// ✅ Get crew status overview
async function getCrewStatusData() {
  const totalCrew = await prisma.crew.count({
    where: { isActive: true }
  });

  const assignedCrew = await prisma.crew.count({
    where: { 
      isActive: true,
      shipId: { not: null }
    }
  });

  const crewByRole = await prisma.crew.groupBy({
    by: ['role'],
    _count: { id: true },
    where: { isActive: true }
  });

  return {
    totalCrew,
    assignedCrew,
    availableCrew: totalCrew - assignedCrew,
    utilizationRate: totalCrew > 0 ? Math.round((assignedCrew / totalCrew) * 100) : 0,
    roleDistribution: crewByRole.map(role => ({
      role: role.role.replace(/_/g, ' '),
      count: role._count.id
    }))
  };
}

// ✅ Get recent activity feed
async function getRecentActivity() {
  // Simulate recent activities - in real system, this would come from activity logs
  const recentShipments = await prisma.shipment.findMany({
    where: { isActive: true },
    include: {
      ship: { select: { name: true } },
      originPort: { select: { name: true } },
      destinationPort: { select: { name: true } }
    },
    orderBy: { updatedAt: 'desc' },
    take: 10
  });

  return recentShipments.map(shipment => ({
    id: `shipment-${shipment.id}`,
    type: 'shipment',
    description: `Shipment ${shipment.id} ${getActivityDescription(shipment.status)}`,
    details: `${shipment.ship?.name || 'Unassigned'} - ${shipment.originPort?.name || 'Origin'} to ${shipment.destinationPort?.name || 'Destination'}`,
    timestamp: shipment.updatedAt,
    status: shipment.status
  }));
}

// ✅ Get key performance indicators
async function getKPIMetrics() {
  const [totalRevenue, operationalCosts] = await Promise.all([
    // Mock revenue calculation - in real system, this would come from financial data
    Promise.resolve(2450000), // $2.45M monthly revenue
    Promise.resolve(1850000)  // $1.85M operational costs
  ]);

  const profitMargin = ((totalRevenue - operationalCosts) / totalRevenue * 100).toFixed(1);

  return {
    monthlyRevenue: totalRevenue,
    operationalCosts,
    profitMargin: parseFloat(profitMargin),
    customerSatisfaction: 94.5, // Mock data
    fuelEfficiency: 87.2, // Mock data
    onTimeDelivery: 92.8 // This could be calculated from actual shipment data
  };
}

// Helper functions
function calculateRouteProgress(departureDate, arrivalEstimate) {
  if (!departureDate || !arrivalEstimate) return 0;
  
  const now = new Date();
  const departure = new Date(departureDate);
  const arrival = new Date(arrivalEstimate);
  
  if (now < departure) return 0;
  if (now > arrival) return 100;
  
  const totalDuration = arrival - departure;
  const elapsed = now - departure;
  
  return Math.round((elapsed / totalDuration) * 100);
}

function getActivityDescription(status) {
  const descriptions = {
    'pending': 'is being prepared for departure',
    'in_transit': 'is currently in transit',
    'delivered': 'has been delivered successfully',
    'delayed': 'has been delayed',
    'cancelled': 'has been cancelled'
  };
  return descriptions[status] || 'status updated';
}

// ✅ Get operational statistics for quick overview
export const getOperationalStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      prisma.ship.count({ where: { isActive: true, status: 'active' } }),
      prisma.shipment.count({ where: { isActive: true, status: 'in_transit' } }),
      prisma.crew.count({ where: { isActive: true } }),
      prisma.port.count({ where: { isActive: true } })
    ]);

    res.json({
      data: {
        activeShips: stats[0],
        shipmentsInTransit: stats[1],
        totalCrew: stats[2],
        activePorts: stats[3],
        systemStatus: 'operational',
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Operational stats error:", error);
    res.status(500).json({ error: "Failed to fetch operational statistics" });
  }
};

// ✅ Get critical alerts only
export const getCriticalAlerts = async (req, res) => {
  try {
    const alerts = await getOperationalAlerts();
    const criticalAlerts = alerts.filter(alert => alert.priority === 'high');
    
    res.json({
      data: {
        alerts: criticalAlerts,
        count: criticalAlerts.length,
        lastChecked: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Critical alerts error:", error);
    res.status(500).json({ error: "Failed to fetch critical alerts" });
  }
};