import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShipForm } from '@/components/forms/ShipForm';
import { useShips, decommissionShip, createShip, updateShip } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Trash2, Plus, Navigation } from 'lucide-react';

import type { Ship as ShipType, ShipFormData } from '@/types';

interface Ship {
  id: number;
  name: string;
  registrationNo: string;
  registrationNumber: string;
  capacityInTonnes: number;
  type: string;
  status: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Ship Form Modal Component
const ShipFormModal = ({ 
  mode, 
  ship, 
  onShipSaved, 
  trigger 
}: {
  mode: 'create' | 'edit';
  ship?: Ship | null;
  onShipSaved: () => void;
  trigger: React.ReactElement;
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: ShipFormData) => {
    try {
      setIsLoading(true);
      
      if (mode === 'create') {
        // Create new ship
        await createShip(data);
        toast({
          title: "Ship Created",
          description: "The ship has been successfully created.",
        });
      } else if (mode === 'edit' && ship) {
        // Update existing ship
        await updateShip(ship.id, data);
        toast({
          title: "Ship Updated",
          description: "The ship has been successfully updated.",
        });
      }
      
      onShipSaved();
      setOpen(false);
    } catch (error: any) {
      console.error('Ship form submission error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the ship.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  // Convert ship data to match ShipForm interface
  const shipData: ShipType | null = ship ? {
    id: ship.id,
    name: ship.name,
    registrationNumber: ship.registrationNumber || ship.registrationNo,
    capacityInTonnes: ship.capacityInTonnes,
    type: ship.type as any,
    status: ship.status as any,
    isActive: ship.isActive ?? true,
    createdAt: ship.createdAt,
    updatedAt: ship.updatedAt,
    crew: [],
    shipments: []
  } : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <ShipForm
          ship={shipData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
};

export default function Ships() {
  const { data: ships = [], isLoading, error, refetch } = useShips({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "under_maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "decommissioned":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatCapacity = (n: number) => `${Number(n).toLocaleString()} tonnes`;
  const formatType = (type: string) => 
    type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formatStatus = (status: string) => 
    status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleViewShip = (shipId: number) => {
    navigate(`/ships/${shipId}`);
  };

  const handleDecommission = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to decommission "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await decommissionShip(id);
      await refetch();
      toast({
        title: "Ship Decommissioned",
        description: `"${name}" has been successfully decommissioned.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decommission ship. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShipSaved = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-muted-foreground">Loading ships...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-red-500">Failed to fetch ships. Please try again.</p>
      </div>
    );
  }

  // Ensure ships data is properly handled
  const shipsData = Array.isArray(ships) ? ships : ships?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <span>🚢</span>
            <span>Fleet Management</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your shipping fleet
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/tracking')}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Navigation className="mr-2 h-4 w-4" />
            Track Ships
          </Button>
          <ShipFormModal
            mode="create"
            onShipSaved={handleShipSaved}
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add New Ship
              </Button>
            }
          />
        </div>
      </div>

      {/* Ships Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No ships found. Add your first ship to get started.
                </TableCell>
              </TableRow>
            ) : (
              shipsData.map((ship: Ship) => (
                <TableRow 
                  key={ship.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewShip(ship.id)}
                >
                  <TableCell className="font-medium">{ship.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {ship.registrationNumber || ship.registrationNo}
                  </TableCell>
                  <TableCell>{formatType(ship.type)}</TableCell>
                  <TableCell>{formatCapacity(ship.capacityInTonnes)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusVariant(ship.status)} variant="outline">
                      {formatStatus(ship.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleViewShip(ship.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <ShipFormModal
                        mode="edit"
                        ship={ship}
                        onShipSaved={handleShipSaved}
                        trigger={
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => handleDecommission(ship.id, ship.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
