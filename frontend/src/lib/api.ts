import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---- Authentication ----
export const login = async (credentials: { username: string; password: string }) => {
  const { data } = await API.post('/auth/login', credentials);
  return data;
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  fullName: string;
}) => {
  const { data } = await API.post('/auth/register', userData);
  return data;
};

export const getProfile = async () => {
  const { data } = await API.get('/auth/profile');
  return data;
};

// ---- Clients ----
export const fetchClients = async (params = {}) => {
  const { data } = await API.get("/clients", { params });
  return data;
};

export const fetchClientById = async (id: number) => {
  const { data } = await API.get(`/clients/${id}`);
  return data;
};

export const createClient = async (clientData: {
  first_name: string;
  last_name: string;
  email_address?: string;
  phone_number?: string;
  address?: string;
}) => {
  const { data } = await API.post('/clients', clientData);
  return data;
};

export const updateClient = async (id: number, clientData: Partial<{
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  address: string;
}>) => {
  const { data } = await API.put(`/clients/${id}`, clientData);
  return data;
};

export const deactivateClient = async (id: number) => {
  const { data } = await API.patch(`/clients/${id}/deactivate`);
  return data;
};

export const reactivateClient = async (id: number) => {
  const { data } = await API.patch(`/clients/${id}/reactivate`);
  return data;
};

export const fetchClientStats = async () => {
  const { data } = await API.get('/clients/stats');
  return data;
};

// ---- Cargo ----
export const fetchCargo = async (params = {}) => {
  const { data } = await API.get('/cargo', { params });
  return data;
};

export const fetchCargoById = async (id: number) => {
  const { data } = await API.get(`/cargo/${id}`);
  return data;
};

export const createCargo = async (cargoData: {
  description: string;
  weight: number;
  client_id: number;
  volume?: number;
  cargo_type?: string;
}) => {
  const { data } = await API.post('/cargo', cargoData);
  return data;
};

export const updateCargo = async (id: number, cargoData: Partial<{
  description: string;
  weight: number;
  client_id: number;
  volume: number;
  cargo_type: string;
  safety_confirmed?: boolean;
}>) => {
  const { data } = await API.put(`/cargo/${id}`, cargoData);
  return data;
};

export const deactivateCargo = async (id: number) => {
  const { data } = await API.patch(`/cargo/${id}/deactivate`);
  return data;
};

export const reactivateCargo = async (id: number) => {
  const { data } = await API.patch(`/cargo/${id}/reactivate`);
  return data;
};

export const fetchCargoStats = async () => {
  const { data } = await API.get('/cargo/stats');
  return data;
};

// ---- Crew ----
export const fetchCrew = async (params = {}) => {
  const { data } = await API.get('/crew', { params });
  return data;
};

export const fetchCrewById = async (id: number) => {
  const { data } = await API.get(`/crew/${id}`);
  return data;
};

export const createCrewMember = async (crewData: {
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string;
  nationality?: string;
  ship_id?: number;
}) => {
  const { data } = await API.post('/crew', crewData);
  return data;
};

export const updateCrewMember = async (id: number, crewData: Partial<{
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string;
  nationality: string;
  ship_id: number;
}>) => {
  const { data } = await API.put(`/crew/${id}`, crewData);
  return data;
};

export const assignCrewToShip = async (id: number, shipId: number) => {
  const { data } = await API.patch(`/crew/${id}/assign`, { ship_id: shipId });
  return data;
};

export const unassignCrewFromShip = async (id: number) => {
  const { data } = await API.patch(`/crew/${id}/unassign`);
  return data;
};

export const deactivateCrewMember = async (id: number) => {
  const { data } = await API.patch(`/crew/${id}/deactivate`);
  return data;
};

export const reactivateCrewMember = async (id: number) => {
  const { data } = await API.patch(`/crew/${id}/reactivate`);
  return data;
};

export const fetchAvailableCrew = async (params = {}) => {
  const { data } = await API.get('/crew/available', { params });
  return data;
};

export const fetchCrewStats = async () => {
  const { data } = await API.get('/crew/stats');
  return data;
};

// ---- Ports ----
export const fetchPorts = async (params = {}) => {
  const { data } = await API.get('/ports', { params });
  return data;
};

export const fetchPortById = async (id: number) => {
  const { data } = await API.get(`/ports/${id}`);
  return data;
};

export const fetchPortsForMap = async (params = {}) => {
  const { data } = await API.get('/ports/map', { params });
  return data;
};

export const createPort = async (portData: {
  name: string;
  country: string;
  coordinates: string;
  port_type?: string;
  docking_capacity?: number;
  customs_authorized?: boolean;
}) => {
  const { data } = await API.post('/ports', portData);
  return data;
};

export const updatePort = async (id: number, portData: Partial<{
  name: string;
  country: string;
  coordinates: string;
  port_type: string;
  docking_capacity: number;
  customs_authorized: boolean;
}>) => {
  const { data } = await API.put(`/ports/${id}`, portData);
  return data;
};

export const archivePort = async (id: number) => {
  const { data } = await API.patch(`/ports/${id}/archive`);
  return data;
};

export const reactivatePort = async (id: number) => {
  const { data } = await API.patch(`/ports/${id}/reactivate`);
  return data;
};

export const fetchPortStats = async () => {
  const { data } = await API.get('/ports/stats');
  return data;
};

export const validatePortCapacityForShip = async (portId: number, shipId: number) => {
  const { data } = await API.get(`/ports/${portId}/validate-ship/${shipId}`);
  return data;
};

// ---- Shipments ----
export const fetchShipments = async (params = {}) => {
  const { data } = await API.get('/shipments', { params });
  return data;
};

export const fetchShipmentById = async (id: number) => {
  const { data } = await API.get(`/shipments/${id}`);
  return data;
};

export const fetchShipmentsTimeline = async (params = {}) => {
  const { data } = await API.get('/shipments/timeline', { params });
  return data;
};

export const createShipment = async (shipmentData: {
  cargo_id: number;
  ship_id: number;
  origin_port_id: number;
  destination_port_id: number;
  departure_date: string;
  arrival_estimate?: string;
}) => {
  const { data } = await API.post('/shipments', shipmentData);
  return data;
};

export const updateShipment = async (id: number, shipmentData: Partial<{
  cargo_id: number;
  ship_id: number;
  origin_port_id: number;
  destination_port_id: number;
  departure_date: string;
  arrival_estimate: string;
  actual_arrival_date: string;
}>) => {
  const { data } = await API.put(`/shipments/${id}`, shipmentData);
  return data;
};

export const updateShipmentStatus = async (id: number, statusData: {
  status: string;
  reason?: string;
}) => {
  const { data } = await API.patch(`/shipments/${id}/status`, statusData);
  return data;
};

export const cancelShipment = async (id: number, reason: string) => {
  const { data } = await API.patch(`/shipments/${id}/cancel`, { reason });
  return data;
};

export const fetchShipmentStats = async () => {
  const { data } = await API.get('/shipments/stats');
  return data;
};

// ---- Ships ----
export const fetchShips = async (params = {}) => {
  const res = await API.get("/ships", { params });
  const ships = res.data?.data || res.data;

  // Normalize backend snake_case to frontend camelCase
  return {
    data: Array.isArray(ships)
      ? ships.map((ship) => ({
          id: ship.id,
          name: ship.name,
          registrationNumber: ship.registrationNo || ship.registration_number,
          capacityInTonnes: ship.capacityInTonnes || ship.capacity_in_tonnes,
          type: ship.type,
          status: ship.status,
          isActive: ship.isActive ?? ship.is_active ?? true,
          createdAt: ship.createdAt || ship.created_at,
          updatedAt: ship.updatedAt || ship.updated_at,
          crew: ship.crew || [],
          shipments: ship.shipments || [],
        }))
      : [],
    pagination: res.data?.pagination
  };
};

export const fetchShipById = async (id: number) => {
  const { data } = await API.get(`/ships/${id}`);
  return data;
};

export const createShip = async (payload: {
  name: string;
  registration_number: string;
  capacity_in_tonnes: number;
  type?: string;
  status?: string;
}) => {
  const { data } = await API.post("/ships", payload);
  return data;
};

export const updateShip = async (
  id: number,
  payload: Partial<{
    name: string;
    registration_number: string;
    capacity_in_tonnes: number;
    type: string;
    status: string;
  }>
) => {
  const { data } = await API.put(`/ships/${id}`, payload);
  return data;
};

export const decommissionShip = async (id: number) => {
  const { data } = await API.patch(`/ships/${id}/decommission`);
  return data;
};

export const useShips = (params = {}) => {
  return useQuery({
    queryKey: ["get-ships", params],
    queryFn: () => fetchShips(params),
  });
};

// Aliases for consistency
export const getShips = fetchShips;
export const getPorts = fetchPorts;

// ---- Journey Management ----
export const fetchJourneys = async (params = {}) => {
  const { data } = await API.get('/journeys', { params });
  return data;
};

export const createJourney = async (journeyData: {
  shipId: number;
  originPortId: number;
  destinationPortId: number;
  departureTime: string;
  speed?: number;
}) => {
  const { data } = await API.post('/journeys', journeyData);
  return data;
};

export const startJourney = async (journeyId: number) => {
  const { data } = await API.patch(`/journeys/${journeyId}/start`);
  return data;
};

export const cancelJourney = async (journeyId: number, reason?: string) => {
  const { data } = await API.patch(`/journeys/${journeyId}/cancel`, { reason });
  return data;
};

export const fetchJourneyById = async (id: number) => {
  const { data } = await API.get(`/journeys/${id}`);
  return data;
};

export const fetchActiveShipPositions = async () => {
  const { data } = await API.get('/journeys/active-positions');
  return data;
};

export const updateShipPosition = async (shipId: number, position: {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}) => {
  const { data } = await API.post(`/journeys/ships/${shipId}/position`, position);
  return data;
};

export const useJourneys = (params = {}) => {
  return useQuery({
    queryKey: ["journeys", params],
    queryFn: () => fetchJourneys(params),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useActiveShipPositions = () => {
  return useQuery({
    queryKey: ["active-ship-positions"],
    queryFn: fetchActiveShipPositions,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time tracking
  });
};

// ---- Analytics ----
export const fetchFleetUtilization = async () => {
  try {
    const { data } = await API.get("/analytics/fleet-utilization");
    return data;
  } catch (err) {
    console.error("Error fetching fleet utilization:", err);
    throw err;
  }
};

export const fetchRouteEfficiency = async () => {
  try {
    const { data } = await API.get("/analytics/route-efficiency");
    return data;
  } catch (err) {
    console.error("Error fetching route efficiency:", err);
    throw err;
  }
};

export const fetchCrewAnalytics = async () => {
  try {
    const { data } = await API.get("/analytics/crew-analytics");
    return data;
  } catch (err) {
    console.error("Error fetching crew analytics:", err);
    throw err;
  }
};

export const fetchPortPerformance = async () => {
  try {
    const { data } = await API.get("/analytics/port-performance");
    return data;
  } catch (err) {
    console.error("Error fetching port performance:", err);
    throw err;
  }
};

export const fetchPredictiveInsights = async () => {
  try {
    const { data } = await API.get("/analytics/predictive-insights");
    return data;
  } catch (err) {
    console.error("Error fetching predictive insights:", err);
    throw err;
  }
};

export const fetchDashboardAnalytics = async () => {
  try {
    const { data } = await API.get("/analytics/dashboard");
    return data;
  } catch (err) {
    console.error("Error fetching dashboard analytics:", err);
    throw err;
  }
};

// ---- Dashboard Real-time Data ----
export const fetchDashboardData = async () => {
  try {
    const { data } = await API.get("/dashboard");
    return data;
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    throw err;
  }
};

export const fetchOperationalStats = async () => {
  try {
    const { data } = await API.get("/dashboard/stats");
    return data;
  } catch (err) {
    console.error("Error fetching operational stats:", err);
    throw err;
  }
};

export const fetchCriticalAlerts = async () => {
  try {
    const { data } = await API.get("/dashboard/alerts");
    return data;
  } catch (err) {
    console.error("Error fetching critical alerts:", err);
    throw err;
  }
};

export default API;
