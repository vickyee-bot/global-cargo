import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Ship, 
  MapPin, 
  Navigation, 
  Clock, 
  Gauge, 
  Route, 
  X,
  Activity,
  Info,
  Target,
  Calendar,
  Compass
} from 'lucide-react';

interface ShipDetailsProps {
  selectedShip: {
    journeyId: number;
    ship: {
      id: number;
      name: string;
      registrationNumber: string;
      type: string;
      status: string;
      specifications?: {
        length?: number;
        width?: number;
        grossTonnage?: number;
        cargoCapacity?: number;
        yearBuilt?: number;
      };
    };
    route: {
      origin: {
        name: string;
        country: string;
        latitude?: number;
        longitude?: number;
      };
      destination: {
        name: string;
        country: string;
        latitude?: number;
        longitude?: number;
      };
    };
    currentPosition: {
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
      timestamp: string;
    } | null;
    progress: number;
    status: string;
    estimatedArrival: string;
  };
  onClose: () => void;
}

export function ShipDetailsPanel({ selectedShip, onClose }: ShipDetailsProps) {
  const formatCoordinates = (lat?: number, lng?: number) => {
    if (lat === undefined || lng === undefined) return 'N/A';
    const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`;
    const lngStr = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
    return `${latStr}, ${lngStr}`;
  };

  const formatSpeed = (speed?: number) => {
    if (!speed) return 'N/A';
    return `${speed.toFixed(1)} knots`;
  };

  const formatHeading = (heading?: number) => {
    if (heading === undefined) return 'N/A';
    
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(heading / 22.5) % 16;
    return `${heading.toFixed(0)}° (${directions[index]})`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatETA = (eta: string) => {
    if (!eta) return 'N/A';
    return new Date(eta).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planned: { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Planned' },
      in_progress: { color: 'bg-green-100 text-green-800 border-green-300', label: 'In Progress' },
      completed: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelled' },
      delayed: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Delayed' },
      docked: { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Docked' },
      at_sea: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'At Sea' },
      maintenance: { color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Maintenance' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.at_sea;
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getShipTypeBadge = (type: string) => {
    const typeConfig = {
      container: { color: 'bg-blue-100 text-blue-800', label: 'Container Ship' },
      bulk_carrier: { color: 'bg-yellow-100 text-yellow-800', label: 'Bulk Carrier' },
      oil_tanker: { color: 'bg-red-100 text-red-800', label: 'Oil Tanker' },
      cargo: { color: 'bg-green-100 text-green-800', label: 'Cargo Ship' },
      passenger: { color: 'bg-purple-100 text-purple-800', label: 'Passenger Ship' },
      roro: { color: 'bg-indigo-100 text-indigo-800', label: 'RoRo Ship' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { color: 'bg-gray-100 text-gray-800', label: type };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-md h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Ship className="h-6 w-6 text-blue-600" />
            Ship Details
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 overflow-y-auto">
        {/* Ship Basic Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">{selectedShip.ship.name}</h3>
          <div className="flex flex-wrap gap-2">
            {getShipTypeBadge(selectedShip.ship.type)}
            {getStatusBadge(selectedShip.ship.status)}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Registration:</span>
              <span className="font-mono">{selectedShip.ship.registrationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Ship ID:</span>
              <span className="font-mono">{selectedShip.ship.id}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Journey Status */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Route className="h-4 w-4" />
            Current Journey
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status:</span>
              {getStatusBadge(selectedShip.status)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Progress:</span>
              <span className="font-semibold">{selectedShip.progress.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Route Information */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Route
          </h4>
          <div className="space-y-3">
            {/* Origin */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="font-medium">Origin</span>
              </div>
              <div className="text-sm text-gray-700">
                <div>{selectedShip.route.origin.name}</div>
                <div className="text-gray-500">{selectedShip.route.origin.country}</div>
                <div className="text-xs font-mono">
                  {formatCoordinates(selectedShip.route.origin.latitude, selectedShip.route.origin.longitude)}
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="font-medium">Destination</span>
              </div>
              <div className="text-sm text-gray-700">
                <div>{selectedShip.route.destination.name}</div>
                <div className="text-gray-500">{selectedShip.route.destination.country}</div>
                <div className="text-xs font-mono">
                  {formatCoordinates(selectedShip.route.destination.latitude, selectedShip.route.destination.longitude)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Current Position */}
        {selectedShip.currentPosition && (
          <>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Current Position
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Coordinates:</span>
                  <div className="font-mono text-xs mt-1">
                    {formatCoordinates(
                      selectedShip.currentPosition.latitude,
                      selectedShip.currentPosition.longitude
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Speed:</span>
                  <div className="font-semibold mt-1 flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    {formatSpeed(selectedShip.currentPosition.speed)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Heading:</span>
                  <div className="font-semibold mt-1 flex items-center gap-1">
                    <Compass className="h-3 w-3" />
                    {formatHeading(selectedShip.currentPosition.heading)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Last Update:</span>
                  <div className="text-xs mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(selectedShip.currentPosition.timestamp)}
                  </div>
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Schedule */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </h4>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Arrival:</span>
              <span className="font-semibold">{formatETA(selectedShip.estimatedArrival)}</span>
            </div>
          </div>
        </div>

        {/* Ship Specifications (if available) */}
        {selectedShip.ship.specifications && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {selectedShip.ship.specifications.length && (
                  <div>
                    <span className="text-gray-600">Length:</span>
                    <div className="font-semibold">{selectedShip.ship.specifications.length}m</div>
                  </div>
                )}
                {selectedShip.ship.specifications.width && (
                  <div>
                    <span className="text-gray-600">Width:</span>
                    <div className="font-semibold">{selectedShip.ship.specifications.width}m</div>
                  </div>
                )}
                {selectedShip.ship.specifications.grossTonnage && (
                  <div>
                    <span className="text-gray-600">Gross Tonnage:</span>
                    <div className="font-semibold">{selectedShip.ship.specifications.grossTonnage.toLocaleString()}</div>
                  </div>
                )}
                {selectedShip.ship.specifications.cargoCapacity && (
                  <div>
                    <span className="text-gray-600">Cargo Capacity:</span>
                    <div className="font-semibold">{selectedShip.ship.specifications.cargoCapacity.toLocaleString()} TEU</div>
                  </div>
                )}
                {selectedShip.ship.specifications.yearBuilt && (
                  <div>
                    <span className="text-gray-600">Year Built:</span>
                    <div className="font-semibold">{selectedShip.ship.specifications.yearBuilt}</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}