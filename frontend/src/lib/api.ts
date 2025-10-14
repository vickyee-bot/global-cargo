import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Clients ----
export const fetchClients = async (params = {}) => {
  try {
    const { data } = await API.get("/clients", { params });
    return data;
  } catch (err) {
    console.error("Error fetching clients:", err);
    throw err;
  }
};

export const deactivateClient = async (id: number) => {
  try {
    return await API.patch(`/clients/${id}/deactivate`);
  } catch (err) {
    console.error(`Error deactivating client ${id}:`, err);
    throw err;
  }
};

// ---- Ships ----
export const useShips = (params = {}) => {
  return useQuery({
    queryKey: ["get-ships", params],
    queryFn: async () => {
      const res = await API.get("/ships", { params });
      const ships = res.data?.data || res.data;

      // Normalize backend snake_case to frontend camelCase
      return Array.isArray(ships)
        ? ships.map((ship) => ({
            id: ship.id,
            name: ship.name,
            registrationNo: ship.registration_number,
            capacityInTonnes: ship.capacity_in_tonnes,
            type: ship.type,
            status: ship.status,
            isActive: ship.is_active ?? ship.isActive,
          }))
        : [];
    },
  });
};

export const createShip = async (payload: {
  name: string;
  registration_number: string;
  capacity_in_tonnes: number;
  type?: string;
  status?: string;
}) => {
  try {
    return await API.post("/ships", payload);
  } catch (err) {
    console.error("Error creating ship:", err);
    throw err;
  }
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
  try {
    return await API.put(`/ships/${id}`, payload);
  } catch (err) {
    console.error(`Error updating ship ${id}:`, err);
    throw err;
  }
};

export const decommissionShip = async (id: number) => {
  try {
    return await API.patch(`/ships/${id}/decommission`);
  } catch (err) {
    console.error(`Error decommissioning ship ${id}:`, err);
    throw err;
  }
};

export default API;
