import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Search, Filter, Weight, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Cargo() {
  const cargoItems = [
    {
      id: "CG-001",
      description: "Electronics Components",
      type: "General Cargo",
      weight: "12.5 tons",
      volume: "85 m³",
      client: "Global Electronics Corp",
      dangerous: false,
      temperature: "Ambient",
      status: "Ready",
      destination: "Hamburg Port"
    },
    {
      id: "CG-002", 
      description: "Industrial Machinery",
      type: "Heavy Machinery",
      weight: "45.2 tons",
      volume: "120 m³",
      client: "European Machinery Ltd",
      dangerous: false,
      temperature: "Ambient",
      status: "In Transit",
      destination: "Rotterdam Port"
    },
    {
      id: "CG-003",
      description: "Chemical Products",
      type: "Dangerous Goods",
      weight: "8.7 tons",
      volume: "55 m³",
      client: "ChemCorp Industries",
      dangerous: true,
      temperature: "Controlled",
      status: "Processing",
      destination: "Singapore Port"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-success text-success-foreground";
      case "In Transit":
        return "bg-primary text-primary-foreground";
      case "Processing":
        return "bg-warning text-warning-foreground";
      case "Delivered":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "General Cargo":
        return "bg-accent text-accent-foreground";
      case "Heavy Machinery":
        return "bg-secondary text-secondary-foreground";
      case "Dangerous Goods":
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
            <Package className="w-6 h-6 text-primary" />
            <span>Cargo Management</span>
          </h1>
          <p className="text-muted-foreground">Track and manage cargo inventory</p>
        </div>
        <Button className="bg-gradient-ocean text-primary-foreground shadow-ocean hover:shadow-elevated">
          <Plus className="w-4 h-4 mr-2" />
          Add New Cargo
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search cargo by description, type, or client..." 
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
        {cargoItems.map((cargo) => (
          <Card key={cargo.id} className="shadow-card hover:shadow-elevated transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center space-x-2">
                  <span>{cargo.description}</span>
                  {cargo.dangerous && (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  )}
                </CardTitle>
                <Badge className={getStatusColor(cargo.status)}>
                  {cargo.status}
                </Badge>
              </div>
              <CardDescription className="font-mono text-xs">
                {cargo.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge className={getTypeColor(cargo.type)}>
                  {cargo.type}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-1">
                  <Weight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Weight:</span>
                </div>
                <p className="font-medium">{cargo.weight}</p>
                <div>
                  <span className="text-muted-foreground">Volume:</span>
                </div>
                <p className="font-medium">{cargo.volume}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Client:</span>
                <p className="font-medium">{cargo.client}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Temperature:</span>
                <p className="font-medium">{cargo.temperature}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Destination:</span>
                <p className="font-medium">{cargo.destination}</p>
              </div>
              <div className="flex space-x-2 pt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}