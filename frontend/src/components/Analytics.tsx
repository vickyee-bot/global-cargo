import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  fetchFleetUtilization,
  fetchRouteEfficiency,
  fetchCrewAnalytics,
  fetchPortPerformance,
  fetchPredictiveInsights
} from "@/lib/api";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertTriangle,
  Ship,
  Users,
  MapPin,
  Package,
  Calendar,
  Clock,
  DollarSign,
  Target,
  CheckCircle,
  Loader2
} from "lucide-react";

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [fleetUtilization, setFleetUtilization] = useState(null);
  const [routeEfficiency, setRouteEfficiency] = useState([]);
  const [crewAnalytics, setCrewAnalytics] = useState(null);
  const [portPerformance, setPortPerformance] = useState([]);
  const [predictiveInsights, setPredictiveInsights] = useState([]);
  const { toast } = useToast();

  // Fetch all analytics data
  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        setLoading(true);
        
        const [fleetData, routeData, crewData, portData, insightsData] = await Promise.all([
          fetchFleetUtilization(),
          fetchRouteEfficiency(),
          fetchCrewAnalytics(),
          fetchPortPerformance(),
          fetchPredictiveInsights()
        ]);

        setFleetUtilization(fleetData.data);
        setRouteEfficiency(routeData.data || []);
        setCrewAnalytics(crewData.data);
        setPortPerformance(portData.data || []);
        setPredictiveInsights(insightsData.data || []);
        
      } catch (error) {
        console.error('Analytics fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnalytics();
  }, [toast]);

  // Loading component
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error fallback - if no data loaded
  if (!fleetUtilization || !crewAnalytics) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground mb-4">No analytics data available</p>
        <Button onClick={() => window.location.reload()}>
          Retry Loading
        </Button>
      </div>
    );
  }

  // Helper functions
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (efficiency >= 80) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Ship,
      MapPin,
      Users,
      Package,
      CheckCircle
    };
    return icons[iconName] || CheckCircle;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-300";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <BarChart3 className="h-8 w-8" />
            <span>Decision Support Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Data-driven insights for strategic maritime operations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button>
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Fleet Utilization Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ship className="h-5 w-5" />
            <span>Fleet Utilization Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{fleetUtilization.utilizationRate}%</div>
              <p className="text-sm text-muted-foreground">Fleet Utilization</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">{fleetUtilization.activeShips}</div>
              <p className="text-sm text-muted-foreground">Active Ships</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600">{fleetUtilization.maintenanceShips}</div>
              <p className="text-sm text-muted-foreground">Under Maintenance</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-600">{fleetUtilization.decommissionedShips}</div>
              <p className="text-sm text-muted-foreground">Decommissioned</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Recommendation:</strong> Fleet utilization is at 75%. Consider activating reserve vessels or optimizing routes to increase efficiency.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Route Efficiency & Port Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Route Efficiency Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routeEfficiency.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{route.route}</h4>
                    <p className="text-sm text-muted-foreground">
                      {route.shipments} shipments • Avg delay: {route.avgDelay} days
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{route.efficiency}%</div>
                    <Badge className={getEfficiencyColor(route.efficiency)} variant="outline">
                      {route.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Port Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portPerformance.map((port, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{port.port}</h4>
                    <p className="text-sm text-muted-foreground">
                      {port.throughput} containers • {port.avgHandlingTime}h avg handling
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{port.efficiency}%</div>
                    <Badge className={getEfficiencyColor(port.efficiency)} variant="outline">
                      {port.rating}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crew Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Crew Resource Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Crew Overview</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Crew:</span>
                  <span className="font-semibold">{crewAnalytics.totalCrew}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Assignments:</span>
                  <span className="font-semibold text-green-600">{crewAnalytics.activeAssignments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className="font-semibold text-blue-600">{crewAnalytics.availableCrew}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Experience:</span>
                  <span className="font-semibold">{crewAnalytics.avgExperience} years</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-semibold mb-4">Workload Distribution</h4>
              <div className="grid grid-cols-2 gap-3">
                {crewAnalytics.workloadDistribution.map((role, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{role.role}</span>
                      <Badge variant={role.demand === "High" ? "destructive" : "outline"}>
                        {role.demand}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold mt-1">{role.count} members</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Predictive Insights & Action Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictiveInsights.map((item, index) => {
              const IconComponent = getIconComponent(item.icon);
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.type}</h4>
                        <Badge className={getPriorityColor(item.priority)} variant="outline">
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.insight}</p>
                      <p className="text-sm font-medium text-blue-600">
                        <strong>Action:</strong> {item.action}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}