import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Clock
} from "lucide-react";

export function Dashboard() {
  // Mock data for dashboard statistics
  const stats = [
    {
      title: "Active Ships",
      value: "24",
      change: "+2 from last week",
      icon: Ship,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Crew Members",
      value: "312",
      change: "+8 this month",
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Active Shipments",
      value: "156",
      change: "+12 in transit",
      icon: Truck,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Ports Connected",
      value: "45",
      change: "+3 new partnerships",
      icon: MapPin,
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  const recentShipments = [
    {
      id: "SH-001",
      ship: "Ocean Explorer",
      route: "Hamburg → Singapore",
      cargo: "Electronics",
      status: "In Transit",
      eta: "2024-07-20"
    },
    {
      id: "SH-002", 
      ship: "Atlantic Voyager",
      route: "New York → Rotterdam",
      cargo: "Machinery",
      status: "Loading",
      eta: "2024-07-18"
    },
    {
      id: "SH-003",
      ship: "Pacific Dawn",
      route: "Shanghai → Los Angeles",
      cargo: "Consumer Goods",
      status: "Arrived",
      eta: "2024-07-16"
    },
    {
      id: "SH-004",
      ship: "Nordic Star",
      route: "Bergen → Montreal",
      cargo: "Raw Materials",
      status: "Delayed",
      eta: "2024-07-22"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Transit":
        return "bg-primary text-primary-foreground";
      case "Loading":
        return "bg-warning text-warning-foreground";
      case "Arrived":
        return "bg-success text-success-foreground";
      case "Delayed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Transit":
        return <Truck className="w-3 h-3" />;
      case "Loading":
        return <Clock className="w-3 h-3" />;
      case "Arrived":
        return <CheckCircle className="w-3 h-3" />;
      case "Delayed":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-ocean rounded-xl p-6 text-primary-foreground shadow-ocean">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to CargoVoyage Control Center</h1>
            <p className="text-primary-foreground/80">
              Monitor and manage your global shipping operations in real-time
            </p>
          </div>
          <div className="hidden md:block">
            <Ship className="w-16 h-16 text-primary-foreground/30" />
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-elevated transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-primary" />
              <span>Recent Shipments</span>
            </CardTitle>
            <CardDescription>
              Latest shipment updates and status changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentShipments.map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{shipment.ship}</span>
                      <Badge variant="outline" className="text-xs">
                        {shipment.id}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shipment.route}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cargo: {shipment.cargo} • ETA: {shipment.eta}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(shipment.status)} flex items-center space-x-1`}>
                    {getStatusIcon(shipment.status)}
                    <span>{shipment.status}</span>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-accent" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common operations and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-gradient-ocean rounded-lg text-primary-foreground hover:shadow-lg transition-all duration-200 group">
                <Ship className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium block">Add New Ship</span>
              </button>
              <button className="p-4 bg-gradient-cargo rounded-lg text-accent-foreground hover:shadow-lg transition-all duration-200 group">
                <Package className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium block">Create Shipment</span>
              </button>
              <button className="p-4 bg-muted rounded-lg text-foreground hover:bg-muted/80 hover:shadow-lg transition-all duration-200 group">
                <Users className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium block">Manage Crew</span>
              </button>
              <button className="p-4 bg-muted rounded-lg text-foreground hover:bg-muted/80 hover:shadow-lg transition-all duration-200 group">
                <Building2 className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium block">Add Client</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}