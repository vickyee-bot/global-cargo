import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { fetchDashboardData } from "@/lib/api";
import { 
  Ship, 
  Users, 
  Package, 
  MapPin, 
  Truck, 
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  RefreshCw,
  Anchor,
  Navigation,
  DollarSign,
  Loader2,
  Bell,
  AlertTriangle,
  Info,
  Zap,
  BarChart3
} from "lucide-react";

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { toast } = useToast();

  // Fetch dashboard data
  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setLoading(true);
      const response = await fetchDashboardData();
      setDashboardData(response.data);
      setLastUpdated(new Date(response.data.lastUpdated));
      
      if (showToast) {
        toast({
          title: "Dashboard Updated",
          description: "Latest operational data has been loaded."
        });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast({
        title: "Update Failed",
        description: "Unable to fetch latest dashboard data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground mb-4">Unable to load dashboard data</p>
        <Button onClick={() => fetchData(true)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const { fleetStatus, shipmentStatus, operationalAlerts, activeRoutes, portOperations, crewStatus, recentActivity, kpiMetrics } = dashboardData;

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_transit":
      case "in transit":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "delayed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <Zap className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
              <Activity className="h-8 w-8" />
              <span>Maritime Operations Control Center</span>
            </h1>
            <p className="text-blue-100 text-lg">
              Monitor and manage your global shipping operations in real-time
            </p>
            {lastUpdated && (
              <p className="text-blue-200 text-sm mt-2">
                Last updated: {formatDateTime(lastUpdated)}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => fetchData(true)}
              disabled={loading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
            <div className="hidden md:block">
              <Ship className="w-16 h-16 text-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {operationalAlerts && operationalAlerts.length > 0 && (
        <div className="space-y-3">
          {operationalAlerts.slice(0, 3).map((alert, index) => (
            <Alert key={alert.id} className={`border-l-4 ${
              alert.priority === 'high' ? 'border-l-red-500 bg-red-50' :
              alert.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
              'border-l-blue-500 bg-blue-50'
            }`}>
              {getAlertIcon(alert.type)}
              <AlertTitle className="flex items-center justify-between">
                <span>{alert.title}</span>
                <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                  {alert.priority.toUpperCase()}
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p>{alert.message}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Action:</strong> {alert.action}
                </p>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Fleet Status */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fleet Status
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Ship className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {fleetStatus?.activeShips || 0}/{fleetStatus?.totalShips || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {fleetStatus?.utilizationRate || 0}% utilization
            </p>
            <div className="mt-3">
              <Progress value={fleetStatus?.utilizationRate || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Shipments in Transit */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Shipments
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <Truck className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {shipmentStatus?.inTransit || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {shipmentStatus?.onTimePerformance || 0}% on-time performance
            </p>
            <div className="mt-3">
              <Progress value={shipmentStatus?.onTimePerformance || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Crew Utilization */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crew Status
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {crewStatus?.assignedCrew || 0}/{crewStatus?.totalCrew || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {crewStatus?.utilizationRate || 0}% crew utilization
            </p>
            <div className="mt-3">
              <Progress value={crewStatus?.utilizationRate || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-yellow-100">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(kpiMetrics?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpiMetrics?.profitMargin || 0}% profit margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Routes */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              <span>Active Routes</span>
            </CardTitle>
            <CardDescription>
              Current shipments and route progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {activeRoutes && activeRoutes.length > 0 ? activeRoutes.map((route, index) => (
                <div key={route.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{route.ship}</h4>
                    <Badge className={getStatusColor(route.status)} variant="outline">
                      {route.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{route.route}</p>
                  {route.progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{route.progress}%</span>
                      </div>
                      <Progress value={route.progress} className="h-2" />
                    </div>
                  )}
                  {route.eta && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ETA: {formatDateTime(route.eta)}
                    </p>
                  )}
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">No active routes</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Port Operations & Recent Activity */}
        <div className="space-y-6">
          {/* Port Operations */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Anchor className="w-5 h-5 text-teal-600" />
                <span>Port Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {portOperations && portOperations.length > 0 ? portOperations.slice(0, 5).map((port, index) => (
                  <div key={port.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <h5 className="font-medium text-sm">{port.name}</h5>
                      <p className="text-xs text-muted-foreground">{port.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{port.totalActivity}</div>
                      <div className="text-xs text-muted-foreground">shipments</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No port activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {recentActivity && recentActivity.length > 0 ? recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common operations and management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
              <Ship className="w-6 h-6" />
              <span className="text-sm">Add Ship</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
              <Package className="w-6 h-6" />
              <span className="text-sm">New Shipment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">Assign Crew</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
