import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, Search, Filter, Ship, MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Shipments() {
  const shipments = [
    {
      id: "SP-001",
      cargo: "Electronics Components",
      ship: "Ocean Explorer",
      client: "Global Electronics Corp",
      origin: "New York Port",
      destination: "Hamburg Port",
      departureDate: "2024-07-15",
      arrivalDate: "2024-07-22",
      status: "In Transit",
      progress: 65
    },
    {
      id: "SP-002",
      cargo: "Industrial Machinery", 
      ship: "Atlantic Voyager",
      client: "European Machinery Ltd",
      origin: "Houston Port",
      destination: "Rotterdam Port",
      departureDate: "2024-07-18",
      arrivalDate: "2024-07-25",
      status: "Loading",
      progress: 15
    },
    {
      id: "SP-003",
      cargo: "Consumer Goods",
      ship: "Pacific Dawn",
      client: "Asia Pacific Goods",
      origin: "Shanghai Port",
      destination: "Los Angeles Port",
      departureDate: "2024-07-12",
      arrivalDate: "2024-07-19",
      status: "Arrived",
      progress: 100
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Truck className="w-6 h-6 text-primary" />
            <span>Shipment Tracking</span>
          </h1>
          <p className="text-muted-foreground">Monitor shipments and delivery status</p>
        </div>
        <Button className="bg-gradient-ocean text-primary-foreground shadow-ocean hover:shadow-elevated">
          <Plus className="w-4 h-4 mr-2" />
          Create Shipment
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search shipments by ID, cargo, or destination..." 
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shipments.map((shipment) => (
          <Card key={shipment.id} className="shadow-card hover:shadow-elevated transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {shipment.cargo}
                </CardTitle>
                <Badge className={getStatusColor(shipment.status)}>
                  {shipment.status}
                </Badge>
              </div>
              <CardDescription className="font-mono text-xs">
                {shipment.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <Ship className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Ship:</span>
                </div>
                <p className="font-medium">{shipment.ship}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Client:</span>
                <p className="font-medium">{shipment.client}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">From:</span>
                  </div>
                  <span className="font-medium text-xs">{shipment.origin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">To:</span>
                  </div>
                  <span className="font-medium text-xs">{shipment.destination}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Departure:</span>
                  </div>
                  <span className="font-medium text-xs">{shipment.departureDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Arrival:</span>
                  </div>
                  <span className="font-medium text-xs">{shipment.arrivalDate}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{shipment.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-ocean h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${shipment.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  Track
                </Button>
                <Button size="sm" className="flex-1">
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}