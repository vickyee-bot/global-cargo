import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createShip, updateShip } from "@/lib/api";

interface Ship {
  id?: number;
  name: string;
  registrationNo?: string;
  capacityInTonnes: number;
  type?: string;
  status?: string;
}

interface ShipFormProps {
  mode?: "add" | "edit";
  ship?: Ship;
  onShipSaved: () => void;
  trigger?: React.ReactNode;
}

export default function ShipForm({
  mode = "add",
  ship,
  onShipSaved,
  trigger,
}: ShipFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    registration_number: "",
    capacity_in_tonnes: 0,
    type: "cargo_ship",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill data in edit mode
  useEffect(() => {
    if (ship && mode === "edit") {
      setFormData({
        name: ship.name || "",
        registration_number: ship.registrationNo || "",
        capacity_in_tonnes: ship.capacityInTonnes || 0,
        type: ship.type || "cargo_ship",
        status: ship.status || "active",
      });
    }
  }, [ship, mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity_in_tonnes"
          ? Number(value) // Convert number input to a real number
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.registration_number) {
      setError("Name and registration number are required.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "add") {
        await createShip(formData);
      } else if (mode === "edit" && ship?.id) {
        await updateShip(ship.id, formData);
      }

      setOpen(false);
      onShipSaved();
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save ship.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-ocean text-primary-foreground shadow-ocean hover:shadow-elevated">
            {mode === "add" ? "Add New Ship" : "Edit Ship"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add a New Ship" : "Edit Ship"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              name="name"
              placeholder="Ship Name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="registration_number">Registration Number *</Label>
            <Input
              name="registration_number"
              placeholder="REG-12345"
              value={formData.registration_number}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="capacity_in_tonnes">Capacity (in tonnes)</Label>
            <Input
              type="number"
              name="capacity_in_tonnes"
              placeholder="10000"
              value={formData.capacity_in_tonnes}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <select
              name="type"
              className="w-full border rounded p-2"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="cargo_ship">Cargo Ship</option>
              <option value="passenger_ship">Passenger Ship</option>
            </select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              name="status"
              className="w-full border rounded p-2"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="decommissioned">Decommissioned</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Saving..."
              : mode === "add"
              ? "Add Ship"
              : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
