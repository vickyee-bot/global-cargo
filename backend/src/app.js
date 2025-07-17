import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import shipRoutes from "./routes/ship.routes.js";
import crewRoutes from "./routes/crew.routes.js";
import portRoutes from "./routes/port.routes.js";
import cargoRoutes from "./routes/cargo.routes.js";
import clientRoutes from "./routes/client.routes.js";
import shipmentRoutes from "./routes/shipment.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

app.use("/api/ships", shipRoutes);
app.use("/api/crew", crewRoutes);
app.use("/api/ports", portRoutes);
app.use("/api/cargo", cargoRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/shipments", shipmentRoutes);

export default app;
