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
import API from "@/lib/api";

interface Client {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
}

interface ClientFormProps {
  mode?: "add" | "edit";
  client?: Client;
  onClientSaved: () => void;
  trigger?: React.ReactNode;
}

export default function ClientForm({
  mode = "add",
  client,
  onClientSaved,
  trigger,
}: ClientFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form in edit mode
  useEffect(() => {
    if (client && mode === "edit") {
      setFormData({
        first_name: client.firstName || "",
        last_name: client.lastName || "",
        email: client.email || "",
        phone: client.phoneNumber || "",
        address: client.address || "",
      });
    }
  }, [client, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      setError("First name and last name are required.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "add") {
        await API.post("/clients", formData);
      } else if (mode === "edit" && client?.id) {
        await API.put(`/clients/${client.id}`, formData);
      }

      setOpen(false);
      onClientSaved();
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-ocean text-primary-foreground shadow-ocean hover:shadow-elevated">
            {mode === "add" ? "Add New Client" : "Edit Client"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add a New Client" : "Edit Client"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Input
            name="first_name"
            placeholder="First Name *"
            value={formData.first_name}
            onChange={handleChange}
          />
          <Input
            name="last_name"
            placeholder="Last Name *"
            value={formData.last_name}
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Saving..."
              : mode === "add"
              ? "Add Client"
              : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
