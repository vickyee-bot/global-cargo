import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ship as ShipIcon, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import ShipForm from "@/components/forms/ShipForm";
import { useShips, decommissionShip } from "@/lib/api";

interface Ship {
  id: number;
  name: string;
  registrationNo: string;
  capacityInTonnes: number;
  type: string;
  status: string;
  isActive?: boolean;
}

export default function Ships() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // ✅ Use React Query hook directly
  const {
    data: ships = [],
    isLoading,
    error,
    refetch,
  } = useShips({
    type: typeFilter || "",
    status: statusFilter || "",
  });

  // ✅ Client-side search
  const visibleShips = ships.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.trim().toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.registrationNo?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "under_maintenance":
        return "bg-warning text-warning-foreground";
      case "decommissioned":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatCapacity = (n: number) => `${Number(n).toLocaleString()} t`;

  const handleDecommission = async (id: number, name: string) => {
    if (!window.confirm(`Decommission ${name}?`)) return;
    try {
      await decommissionShip(id);
      await refetch(); // ✅ trigger React Query refetch instead of loadShips()
    } catch {
      alert("Failed to decommission ship.");
    }
  };

  if (isLoading) return <p>Loading ships...</p>;
  if (error) return <p className="text-red-500">Failed to fetch ships.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <ShipIcon className="w-6 h-6 text-primary" />
            <span>Fleet Management</span>
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor your shipping fleet
          </p>
        </div>
        <ShipForm
          mode="add"
          onShipSaved={refetch} // ✅ trigger refetch on new ship addition
          trigger={
            <Button className="bg-gradient-ocean text-primary-foreground shadow-ocean">
              <Plus className="w-4 h-4 mr-2" />
              Add New Ship
            </Button>
          }
        />
      </div>

      {/* Search + Filter */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search ships by name or registration..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => {
                setTypeFilter(undefined);
                setStatusFilter(undefined);
                setSearchTerm("");
              }}
            >
              <Filter className="w-4 h-4" />
              <span>Clear Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleShips.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            No ships found.
          </p>
        ) : (
          visibleShips.map((ship) => (
            <Card
              key={ship.id}
              className="shadow-card hover:shadow-elevated transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {ship.name}
                  </CardTitle>
                  <Badge className={getStatusBadge(ship.status)}>
                    {ship.status}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-xs">
                  {ship.registrationNo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{ship.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <p className="font-medium">
                      {formatCapacity(ship.capacityInTonnes)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 pt-3">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                  <ShipForm
                    mode="edit"
                    ship={ship}
                    onShipSaved={refetch}
                    trigger={
                      <Button size="sm" className="flex-1">
                        Edit
                      </Button>
                    }
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDecommission(ship.id, ship.name)}
                  >
                    Decommission
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
