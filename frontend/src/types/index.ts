// Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

// Client Types
export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  emailAddress?: string;
  phoneNumber?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cargo?: Cargo[];
}

// Ship Types
export interface Ship {
  id: number;
  name: string;
  registrationNumber: string;
  capacityInTonnes?: number;
  type: ShipType;
  status: ShipStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  crew?: Crew[];
  shipments?: Shipment[];
}

export type ShipType = 'cargo_ship' | 'passenger_ship' | 'military_ship' | 'icebreaker' | 'fishing_vessel' | 'barge_ship';
export type ShipStatus = 'active' | 'under_maintenance' | 'decommissioned';

// Crew Types
export interface Crew {
  id: number;
  shipId?: number;
  firstName: string;
  lastName: string;
  role: CrewRole;
  phoneNumber: string;
  nationality?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ship?: Ship;
}

export type CrewRole = 'Captain' | 'Chief_Officer' | 'Able_Seaman' | 'Ordinary_Seaman' | 'Engine_Cadet' | 'Radio_Officer' | 'Chief_Cook' | 'Steward' | 'Deckhand';

// Port Types
export interface Port {
  id: number;
  name: string;
  country: string;
  portType?: string;
  coordinates?: string;
  depth?: number;
  dockingCapacity?: number;
  maxVesselSize?: number;
  securityLevel?: string;
  customsAuthorized?: boolean;
  operationalHours?: string;
  portManager?: string;
  portContactInfo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shipmentsOrigin?: Shipment[];
  shipmentsDestination?: Shipment[];
  latitude?: number;
  longitude?: number;
}

// Cargo Types
export interface Cargo {
  id: number;
  description?: string;
  weight?: number;
  volume?: number;
  clientId?: number;
  cargoType: CargoType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  shipments?: Shipment[];
  isDangerous?: boolean;
  requiresSpecialHandling?: boolean;
}

export type CargoType = 'perishable' | 'dangerous' | 'general' | 'other';

// Shipment Types
export interface Shipment {
  id: number;
  cargoId?: number;
  shipId?: number;
  originPortId?: number;
  destinationPortId?: number;
  departureDate?: string;
  arrivalEstimate?: string;
  actualArrivalDate?: string;
  status: ShipmentStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cargo?: Cargo;
  ship?: Ship;
  originPort?: Port;
  destinationPort?: Port;
}

export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';

// Analytics Types
export interface FleetUtilization {
  totalShips: number;
  activeShips: number;
  maintenanceShips: number;
  decommissionedShips: number;
  utilizationRate: number;
  totalCapacity: number;
  statusDistribution: Array<{ status: string; _count: { id: number } }>;
}

export interface RouteEfficiency {
  route: string;
  shipments: number;
  avgDelay: number;
  efficiency: number;
  status: 'Excellent' | 'Good' | 'Needs Attention' | 'No Data';
}

export interface CrewAnalytics {
  totalCrew: number;
  activeAssignments: number;
  availableCrew: number;
  avgExperience: number;
  workloadDistribution: Array<{ role: string; count: number; demand?: string }>;
}

export interface PortPerformance {
  port: string;
  throughput: number;
  avgHandlingTime: number;
  efficiency: number;
  rating: 'Excellent' | 'Good' | 'Fair';
}

export interface PredictiveInsight {
  id: string;
  type: string;
  insight: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  icon: string;
}

export interface OperationalAlert {
  id: string;
  type: 'warning' | 'info' | 'urgent';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  timestamp: string;
}

// Dashboard Types
export interface DashboardData {
  fleetStatus: {
    totalShips: number;
    activeShips: number;
    shipsInTransit: number;
    maintenanceShips: number;
    utilizationRate: number;
    statusDistribution: Record<string, number>;
    shipsWithCargo: number;
  };
  shipmentStatus: {
    totalShipments: number;
    inTransit: number;
    delivered: number;
    delayed: number;
    pending: number;
    onTimePerformance: number;
    statusDistribution: Record<string, number>;
    recentShipments: Array<{
      id: number;
      status: string;
      ship: string;
      route: string;
      eta: string;
      cargoType: string;
    }>;
  };
  operationalAlerts: OperationalAlert[];
  activeRoutes: Array<{
    id: number;
    route: string;
    ship: string;
    status: string;
    departure: string;
    eta: string;
    progress: number;
  }>;
  portOperations: Array<{
    id: number;
    name: string;
    country: string;
    outgoingShipments: number;
    incomingShipments: number;
    totalActivity: number;
    operationalHours: string;
  }>;
  crewStatus: {
    totalCrew: number;
    assignedCrew: number;
    availableCrew: number;
    utilizationRate: number;
    roleDistribution: Array<{
      role: string;
      count: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    details: string;
    timestamp: string;
    status: string;
  }>;
  kpiMetrics: {
    monthlyRevenue: number;
    operationalCosts: number;
    profitMargin: number;
    customerSatisfaction: number;
    fuelEfficiency: number;
    onTimeDelivery: number;
  };
  lastUpdated: string;
}

// Form Types
export interface ClientFormData {
  first_name: string;
  last_name: string;
  email_address?: string;
  phone_number?: string;
  address?: string;
}

export interface ShipFormData {
  name: string;
  registration_number: string;
  capacity_in_tonnes: number;
  type?: ShipType;
  status?: ShipStatus;
}

export interface CrewFormData {
  first_name: string;
  last_name: string;
  role: CrewRole;
  phone_number: string;
  nationality?: string;
  ship_id?: number;
}

export interface PortFormData {
  name: string;
  country: string;
  coordinates: string;
  port_type?: string;
  docking_capacity?: number;
  customs_authorized?: boolean;
}

export interface CargoFormData {
  description: string;
  weight: number;
  client_id: number;
  volume?: number;
  cargo_type?: CargoType;
  safety_confirmed?: boolean;
}

export interface ShipmentFormData {
  cargo_id: number;
  ship_id: number;
  origin_port_id: number;
  destination_port_id: number;
  departure_date: string;
  arrival_estimate?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  message?: string;
}

export interface StatsResponse {
  data: Record<string, any>;
}

// Filter Types
export interface FilterParams {
  search?: string;
  status?: string;
  type?: string;
  country?: string;
  role?: string;
  cargo_type?: string;
  client_id?: number;
  ship_id?: number;
  port_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Timeline Types
export interface TimelineItem {
  id: number;
  title: string;
  status: ShipmentStatus;
  departure: string;
  arrival: string;
  route: string;
  cargoType: CargoType;
  priority: 'high' | 'normal';
}