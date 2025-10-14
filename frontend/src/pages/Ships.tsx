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
  const { data: ships = [], isLoading, error, refetch } = useShips({});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "under_maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "decommissioned":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatCapacity = (n: number) => `${Number(n).toLocaleString()} t`;

  const handleDecommission = async (id: number, name: string) => {
    if (!window.confirm(`Decommission ${name}?`)) return;
    try {
      await decommissionShip(id);
      await refetch();
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
            <span role="img" aria-label="ship">
              🚢
            </span>
            <span>Fleet Management</span>
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor your shipping fleet
          </p>
        </div>
        <ShipForm
          mode="add"
          onShipSaved={refetch}
          trigger={
            <Button className="bg-blue-600 text-white">
              <span role="img" aria-label="plus">
                ➕
              </span>{" "}
              Add New Ship
            </Button>
          }
        />
      </div>

      {/* Ships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ships.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            No ships found.
          </p>
        ) : (
          ships.map((ship) => (
            <Card
              key={ship.id}
              className="hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ship.name}</CardTitle>
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
                        ✏️ Edit
                      </Button>
                    }
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDecommission(ship.id, ship.name)}
                  >
                    🗑️ Decommission
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
