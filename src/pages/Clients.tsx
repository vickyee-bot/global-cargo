import { useEffect, useState } from "react";
import { fetchClients } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ClientForm from "@/components/forms/ClientForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { deactivateClient } from "@/lib/api";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadClients = async (search = "") => {
    setLoading(true);
    try {
      const res = await fetchClients(search ? { search } : {});
      setClients(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadClients(searchTerm);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const getStatusColor = (status) => {
    return status
      ? "bg-success text-success-foreground"
      : "bg-muted text-muted-foreground";
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateClient(id);
      loadClients(searchTerm);
    } catch (err) {
      alert("Failed to deactivate client");
    }
  };

  if (loading) return <p>Loading clients...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-primary" />
            <span>Client Management</span>
          </h1>
          <p className="text-muted-foreground">
            Manage customer relationships and contracts
          </p>
        </div>
        <ClientForm onClientSaved={() => loadClients(searchTerm)} />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search clients by name, contact, or location..."
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
        {clients.map((client) => (
          <Card
            key={client.id}
            className="shadow-card hover:shadow-elevated transition-all duration-300 group"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {`${client.firstName} ${client.lastName}`}
                </CardTitle>
                <Badge className={getStatusColor(client.isActive)}>
                  {client.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>{client.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{client.phoneNumber}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-xs">{client.address}</span>
                </div>
              </div>
              <div className="flex space-x-2 pt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
                <ClientForm
                  mode="edit"
                  client={client}
                  onClientSaved={() => loadClients(searchTerm)}
                  trigger={
                    <Button size="sm" className="flex-1">
                      Edit
                    </Button>
                  }
                />
                <ConfirmDialog
                  title="Deactivate Client"
                  message="Are you sure you want to deactivate this client? They will no longer appear in new orders."
                  onConfirm={() => handleDeactivate(client.id)}
                  trigger={
                    <Button size="sm" variant="destructive" className="flex-1">
                      Deactivate
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
