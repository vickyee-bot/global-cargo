import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Ships from "./pages/Ships";
import Crew from "./pages/Crew";
import Clients from "./pages/Clients";
import Cargo from "./pages/Cargo";
import Shipments from "./pages/Shipments";
import Ports from "./pages/Ports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import HealthCheck from "./components/HealthCheck";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ships" element={<Ships />} />
            <Route path="/crew" element={<Crew />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/cargo" element={<Cargo />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/ports" element={<Ports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/health" element={<HealthCheck />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
