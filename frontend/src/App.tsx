import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Ships from "./pages/Ships";
import ShipDetail from "./pages/ShipDetail";
import Crew from "./pages/Crew";
import Clients from "./pages/Clients";
import Cargo from "./pages/Cargo";
import Shipments from "./pages/Shipments";
import Ports from "./pages/Ports";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import HealthCheck from "./components/HealthCheck";
import ShipTracking from "./pages/ShipTracking";
import Journeys from "./pages/Journeys";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Index />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/ships" element={
              <ProtectedRoute>
                <Layout>
                  <Ships />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/ships/:id" element={
              <ProtectedRoute>
                <Layout>
                  <ShipDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/crew" element={
              <ProtectedRoute>
                <Layout>
                  <Crew />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cargo" element={
              <ProtectedRoute>
                <Layout>
                  <Cargo />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/shipments" element={
              <ProtectedRoute>
                <Layout>
                  <Shipments />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/ports" element={
              <ProtectedRoute>
                <Layout>
                  <Ports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/journeys" element={
              <ProtectedRoute>
                <Layout>
                  <Journeys />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tracking" element={
              <ProtectedRoute>
                <Layout>
                  <ShipTracking />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/health" element={
              <ProtectedRoute>
                <Layout>
                  <HealthCheck />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
