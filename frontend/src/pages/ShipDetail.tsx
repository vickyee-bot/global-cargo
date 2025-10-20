import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ShipForm } from "@/components/forms/ShipForm";
import { useToast } from "@/hooks/use-toast";
import { decommissionShip, updateShip, useJourneys } from "@/lib/api";
import { ArrowLeft, Edit, Trash2, Ship, Users, Anchor, Navigation, MapPin, Activity } from "lucide-react";
import API from "@/lib/api";

import type { Ship as ShipType, ShipFormData } from '@/types';

interface Ship {
  id: number;
  name: string;
  registrationNo: string;
  capacityInTonnes: number;
  type: string;
  status: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Journey Tracking Content Component
const JourneyTrackingContent = ({ 
  journeys, 
  shipId, 
  onViewTracking 
}: {
  journeys: any[];
  shipId: number;
  onViewTracking: () => void;
}) => {
  const activeJourney = journeys.find(j => j.status === 'in_progress');
  const recentJourneys = journeys.slice(0, 3);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'text-green-600';
      case 'planned': return 'text-orange-600';
      case 'completed': return 'text-blue-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  if (journeys.length === 0) {
    return (
      <div className="text-center py-8">
        <Navigation className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-muted-foreground mb-4">No journeys found for this ship.</p>
        <Button 
          variant="outline" 
          onClick={onViewTracking}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <MapPin className="h-4 w-4 mr-2" />
          View Ship Tracking
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {activeJourney && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-800">Active Journey</span>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300" variant="outline">
              In Progress
            </Badge>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Route:</span>
              <span className="font-medium">
                {activeJourney.originPort?.name} → {activeJourney.destinationPort?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Progress:</span>
              <span className="font-medium">{activeJourney.progress?.toFixed(1) || '0'}%</span>
            </div>
            {activeJourney.estimatedArrival && (
              <div className="flex justify-between">
                <span className="text-gray-600">ETA:</span>
                <span className="font-medium">
                  {new Date(activeJourney.estimatedArrival).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-700">Recent Journeys</h4>
        {recentJourneys.map((journey, index) => (
          <div key={journey.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div className="flex-1">
              <div className="text-sm font-medium">
                {journey.originPort?.name} → {journey.destinationPort?.name}
              </div>
              <div className="text-xs text-gray-500">
                {journey.departureTime ? new Date(journey.departureTime).toLocaleDateString() : 'Date TBD'}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(journey.status)}`}
            >
              {journey.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
            </Badge>
          </div>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        onClick={onViewTracking}
        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
      >
        <MapPin className="h-4 w-4 mr-2" />
        View Full Tracking
      </Button>
    </div>
  );
};

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
      
      if (mode === 'edit' && ship) {
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
    registrationNumber: ship.registrationNo,
    capacityInTonnes: ship.capacityInTonnes,
    type: ship.type as any,
    status: ship.status as any,
    isActive: ship.isActive ?? true,
    createdAt: ship.createdAt || '',
    updatedAt: ship.updatedAt || '',
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

export default function ShipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ship, setShip] = useState<Ship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch journeys for this ship
  const { 
    data: journeysData = { data: [] },
    isLoading: journeysLoading 
  } = useJourneys({ shipId: id });

  const fetchShip = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await API.get(`/ships/${id}`);
      const shipData = response.data?.data || response.data;
      
      // Normalize backend data to frontend format
      setShip({
        id: shipData.id,
        name: shipData.name,
        registrationNo: shipData.registrationNumber || shipData.registration_number,
        capacityInTonnes: shipData.capacityInTonnes || shipData.capacity_in_tonnes,
        type: shipData.type,
        status: shipData.status,
        isActive: shipData.isActive ?? shipData.is_active ?? true,
        createdAt: shipData.createdAt || shipData.created_at,
        updatedAt: shipData.updatedAt || shipData.updated_at,
      });
    } catch (err: any) {
      console.error("Error fetching ship:", err);
      setError("Failed to load ship details.");
      if (err.response?.status === 404) {
        toast({
          title: "Ship Not Found",
          description: "The requested ship could not be found.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShip();
  }, [id]);

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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDecommission = async () => {
    if (!ship) return;
    
    if (!window.confirm(`Are you sure you want to decommission "${ship.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await decommissionShip(ship.id);
      toast({
        title: "Ship Decommissioned",
        description: `"${ship.name}" has been successfully decommissioned.`,
      });
      // Refresh ship data
      fetchShip();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decommission ship. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShipSaved = () => {
    fetchShip();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-muted-foreground">Loading ship details...</p>
      </div>
    );
  }

  if (error || !ship) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/ships")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ships
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-lg text-red-500 mb-2">{error}</p>
            <Button onClick={() => navigate("/ships")}>
              Return to Fleet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/ships")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ships
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <Ship className="h-8 w-8" />
              <span>{ship.name}</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              {ship.registrationNo}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/tracking?shipId=${ship.id}`)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Track Ship
          </Button>
          <ShipFormModal
            mode="edit"
            ship={ship}
            onShipSaved={handleShipSaved}
            trigger={
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Ship
              </Button>
            }
          />
          {ship.status !== "decommissioned" && (
            <Button
              variant="destructive"
              onClick={handleDecommission}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Decommission
            </Button>
          )}
        </div>
      </div>

      {/* Ship Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ship className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                <p className="text-lg font-semibold">{ship.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <Badge className={getStatusVariant(ship.status)} variant="outline">
                  {formatStatus(ship.status)}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Registration Number</h4>
                <p className="font-mono">{ship.registrationNo}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Ship Type</h4>
                <p>{formatType(ship.type)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Capacity</h4>
              <p className="text-lg font-semibold">{formatCapacity(ship.capacityInTonnes)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Journey Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5" />
              <span>Journey Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {journeysLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading journey data...</p>
              </div>
            ) : (
              <JourneyTrackingContent 
                journeys={journeysData?.data || []} 
                shipId={ship.id}
                onViewTracking={() => navigate(`/tracking?shipId=${ship.id}`)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {(ship.createdAt || ship.updatedAt) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {ship.createdAt && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date Added</h4>
                  <p>{formatDate(ship.createdAt)}</p>
                </div>
              )}
              {ship.updatedAt && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                  <p>{formatDate(ship.updatedAt)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}