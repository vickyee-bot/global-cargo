import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Ship, 
  MapPin, 
  Calendar, 
  Route, 
  Navigation, 
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { createJourney, getShips, getPorts } from '@/lib/api';
import { toast } from 'sonner';

interface CreateJourneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJourneyCreated: () => void;
}

interface Ship {
  id: number;
  name: string;
  registrationNumber: string;
  type: string;
  status: string;
}

interface Port {
  id: number;
  name: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export function CreateJourneyModal({ 
  open, 
  onOpenChange, 
  onJourneyCreated 
}: CreateJourneyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [ships, setShips] = useState<Ship[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    shipId: '',
    originPortId: '',
    destinationPortId: '',
    departureTime: '',
    speed: '',
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load ships and ports when modal opens
  useEffect(() => {
    if (open) {
      loadInitialData();
      // Reset form when modal opens
      setFormData({
        shipId: '',
        originPortId: '',
        destinationPortId: '',
        departureTime: '',
        speed: '',
      });
      setErrors({});
    }
  }, [open]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [shipsResponse, portsResponse] = await Promise.all([
        getShips(),
        getPorts()
      ]);
      
      // Filter ships that are available (not in active journeys)
      const availableShips = shipsResponse.data.filter((ship: Ship) => 
        ship.status !== 'in_journey'
      );
      
      setShips(availableShips);
      setPorts(portsResponse.data);
    } catch (error) {
      toast.error('Failed to load ships and ports');
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.shipId) {
      newErrors.shipId = 'Please select a ship';
    }

    if (!formData.originPortId) {
      newErrors.originPortId = 'Please select an origin port';
    }

    if (!formData.destinationPortId) {
      newErrors.destinationPortId = 'Please select a destination port';
    }

    if (formData.originPortId === formData.destinationPortId) {
      newErrors.destinationPortId = 'Destination must be different from origin';
    }

    if (!formData.departureTime) {
      newErrors.departureTime = 'Please select a departure time';
    } else {
      const departureDate = new Date(formData.departureTime);
      const now = new Date();
      if (departureDate <= now) {
        newErrors.departureTime = 'Departure time must be in the future';
      }
    }

    if (!formData.speed) {
      newErrors.speed = 'Please enter planned speed';
    } else {
      const speed = parseFloat(formData.speed);
      if (speed <= 0 || speed > 50) {
        newErrors.speed = 'Speed must be between 0 and 50 knots';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const journeyData = {
        shipId: parseInt(formData.shipId),
        originPortId: parseInt(formData.originPortId),
        destinationPortId: parseInt(formData.destinationPortId),
        departureTime: formData.departureTime,
        speed: parseFloat(formData.speed),
      };

      await createJourney(journeyData);
      toast.success('Journey created successfully!');
      onJourneyCreated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create journey');
      console.error('Error creating journey:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedShip = ships.find(ship => ship.id === parseInt(formData.shipId));
  const selectedOriginPort = ports.find(port => port.id === parseInt(formData.originPortId));
  const selectedDestinationPort = ports.find(port => port.id === parseInt(formData.destinationPortId));

  const getShipTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      container: 'Container Ship',
      bulk_carrier: 'Bulk Carrier',
      oil_tanker: 'Oil Tanker',
      cargo: 'Cargo Ship',
      passenger: 'Passenger Ship',
      roro: 'RoRo Ship',
    };
    return typeLabels[type] || type;
  };

  // Generate departure time suggestions (next 24 hours in 2-hour intervals)
  const generateDepartureTimes = () => {
    const times = [];
    const now = new Date();
    
    for (let i = 1; i <= 12; i++) {
      const time = new Date(now.getTime() + (i * 2 * 60 * 60 * 1000));
      const isoString = time.toISOString().slice(0, 16);
      const displayString = time.toLocaleString();
      times.push({ value: isoString, label: displayString });
    }
    return times;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-blue-600" />
            Create New Journey
          </DialogTitle>
          <DialogDescription>
            Plan a new journey by selecting a ship, route, and departure details.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading ships and ports...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ship Selection */}
            <div className="space-y-2">
              <Label htmlFor="ship" className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Select Ship
              </Label>
              <Select 
                value={formData.shipId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, shipId: value }))}
              >
                <SelectTrigger className={errors.shipId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Choose a ship..." />
                </SelectTrigger>
                <SelectContent>
                  {ships.map((ship) => (
                    <SelectItem key={ship.id} value={ship.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{ship.name}</span>
                        <span className="text-xs text-gray-500">
                          {ship.registrationNumber} • {getShipTypeBadge(ship.type)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.shipId && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.shipId}
                </p>
              )}
            </div>

            {/* Ship Info Preview */}
            {selectedShip && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Ship className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{selectedShip.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Registration: {selectedShip.registrationNumber}</div>
                  <div>Type: {getShipTypeBadge(selectedShip.type)}</div>
                  <div>Status: {selectedShip.status}</div>
                </div>
              </div>
            )}

            <Separator />

            {/* Route Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Origin Port */}
              <div className="space-y-2">
                <Label htmlFor="origin" className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Origin Port
                </Label>
                <Select 
                  value={formData.originPortId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, originPortId: value }))}
                >
                  <SelectTrigger className={errors.originPortId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select origin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ports.map((port) => (
                      <SelectItem key={port.id} value={port.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{port.name}</span>
                          <span className="text-xs text-gray-500">{port.country}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.originPortId && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.originPortId}
                  </p>
                )}
              </div>

              {/* Destination Port */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Destination Port
                </Label>
                <Select 
                  value={formData.destinationPortId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, destinationPortId: value }))}
                >
                  <SelectTrigger className={errors.destinationPortId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select destination..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ports.map((port) => (
                      <SelectItem 
                        key={port.id} 
                        value={port.id.toString()}
                        disabled={port.id.toString() === formData.originPortId}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{port.name}</span>
                          <span className="text-xs text-gray-500">{port.country}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.destinationPortId && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.destinationPortId}
                  </p>
                )}
              </div>
            </div>

            {/* Route Preview */}
            {selectedOriginPort && selectedDestinationPort && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <div className="font-medium">{selectedOriginPort.name}</div>
                      <div className="text-gray-500">{selectedOriginPort.country}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium">{selectedDestinationPort.name}</div>
                      <div className="text-gray-500">{selectedDestinationPort.country}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Journey Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Departure Time */}
              <div className="space-y-2">
                <Label htmlFor="departure" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Departure Time
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                  className={errors.departureTime ? 'border-red-500' : ''}
                  min={new Date().toISOString().slice(0, 16)}
                />
                {errors.departureTime && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.departureTime}
                  </p>
                )}
              </div>

              {/* Planned Speed */}
              <div className="space-y-2">
                <Label htmlFor="speed" className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Planned Speed (knots)
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 12.5"
                  value={formData.speed}
                  onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value }))}
                  className={errors.speed ? 'border-red-500' : ''}
                  min="0"
                  max="50"
                  step="0.1"
                />
                {errors.speed && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.speed}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Time Selections */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Quick departure times:</Label>
              <div className="flex flex-wrap gap-2">
                {generateDepartureTimes().slice(0, 6).map((time, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, departureTime: time.value }))}
                    className="text-xs"
                  >
                    {time.label.split(', ')[1]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Route className="h-4 w-4 mr-2" />
                    Create Journey
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}