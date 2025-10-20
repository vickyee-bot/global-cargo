import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import shipRoutes from "./routes/ship.routes.js";
import crewRoutes from "./routes/crew.routes.js";
import portRoutes from "./routes/port.routes.js";
import cargoRoutes from "./routes/cargo.routes.js";
import clientRoutes from "./routes/client.routes.js";
import shipmentRoutes from "./routes/shipment.routes.js";
import journeyRoutes from "./routes/journey.routes.js";

dotenv.config();

const app = express();

// ✅ Allow both local and production frontend origins
const allowedOrigins = [
  "http://localhost:3000", // Vite dev server
  "http://localhost:5173", // Vite dev server alternative
  "http://localhost:8080", // local dev
  "http://localhost:8081", // local dev alternative
  "https://global-cargo-frontend.onrender.com", // deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ships", shipRoutes);
app.use("/api/crew", crewRoutes);
app.use("/api/ports", portRoutes);
app.use("/api/cargo", cargoRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/journeys", journeyRoutes);

export default app;
