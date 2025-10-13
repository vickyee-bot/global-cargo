import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Search, Filter, Globe, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Ports() {
  const ports = [
    {
      id: "PT-001",
      name: "Port of Hamburg",
      code: "DEHAM",
      country: "Germany",
      city: "Hamburg",
      coordinates: "53.5511° N, 9.9937° E",
      contact: "+49-40-428-470",
      email: "info@port-hamburg.de",
      capacity: "8.5M TEU",
      status: "Active",
      services: ["Container", "Bulk", "RoRo"]
    },
    {
      id: "PT-002",
      name: "Port of Singapore",
      code: "SGSIN",
      country: "Singapore",
      city: "Singapore",
      coordinates: "1.2966° N, 103.8558° E",
      contact: "+65-6270-7111",
      email: "contact@mpa.gov.sg",
      capacity: "37.2M TEU",
      status: "Active",
      services: ["Container", "Bulk", "Tanker", "RoRo"]
    },
    {
      id: "PT-003",
      name: "Port of Rotterdam",
      code: "NLRTM",
      country: "Netherlands", 
      city: "Rotterdam",
      coordinates: "51.9244° N, 4.4777° E",
      contact: "+31-10-252-1010",
      email: "info@portofrotterdam.com",
      capacity: "15.3M TEU",
      status: "Active",
      services: ["Container", "Bulk", "Chemical", "RoRo"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success text-success-foreground";
      case "Maintenance":
        return "bg-warning text-warning-foreground";
      case "Inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-primary" />
            <span>Port Network</span>
          </h1>
          <p className="text-muted-foreground">Manage port partnerships and connections</p>
        </div>
        <Button className="bg-gradient-ocean text-primary-foreground shadow-ocean hover:shadow-elevated">
          <Plus className="w-4 h-4 mr-2" />
          Add New Port
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search ports by name, code, or country..." 
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
        {ports.map((port) => (
          <Card key={port.id} className="shadow-card hover:shadow-elevated transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {port.name}
                </CardTitle>
                <Badge className={getStatusColor(port.status)}>
                  {port.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center space-x-2">
                <span className="font-mono text-xs">{port.code}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>{port.country}</span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Location:</span>
                <p className="font-medium">{port.city}</p>
                <p className="text-xs text-muted-foreground mt-1">{port.coordinates}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Capacity:</span>
                <p className="font-medium text-primary">{port.capacity}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs">{port.contact}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs truncate">{port.email}</span>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Services:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {port.services.map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2 pt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  View Map
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