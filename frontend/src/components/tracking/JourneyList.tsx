import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Ship, 
  MapPin, 
  Clock, 
  Navigation, 
  Play, 
  X, 
  Eye,
  ArrowRight,
  Activity
} from 'lucide-react';
import { startJourney, cancelJourney } from '@/lib/api';
import { toast } from 'sonner';

interface Journey {
  id: number;
  shipId: number;
  status: string;
  progress: number;
  departureTime?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  distance?: number;
  speed?: number;
  ship: {
    id: number;
    name: string;
    registrationNumber: string;
    type: string;
    status: string;
  };
  originPort: {
    id: number;
    name: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  destinationPort: {
    id: number;
    name: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  positions?: Array<{
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    timestamp: string;
  }>;
}

interface JourneyListProps {
  journeys: Journey[];
  onShipSelect: (ship: any) => void;
  onCenterOnShip: (ship: any) => void;
  isLoading: boolean;
  showActiveOnly: boolean;
}

export function JourneyList({ 
  journeys, 
  onShipSelect, 
  onCenterOnShip, 
  isLoading,
  showActiveOnly 
}: JourneyListProps) {
  
  const handleStartJourney = async (journeyId: number) => {
    try {
      await startJourney(journeyId);
      toast.success('Journey started successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start journey');
    }
  };

  const handleCancelJourney = async (journeyId: number) => {
    if (!window.confirm('Are you sure you want to cancel this journey?')) return;
    
    try {
      await cancelJourney(journeyId);
      toast.success('Journey cancelled successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel journey');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planned: { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Planned' },
      in_progress: { color: 'bg-green-100 text-green-800 border-green-300', label: 'In Progress' },
      completed: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelled' },
      delayed: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Delayed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planned;
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return 'N/A';
    return `${distance.toFixed(0)} nm`;
  };

  const formatSpeed = (speed?: number) => {
    if (!speed) return 'N/A';
    return `${speed.toFixed(1)} knots`;
  };

  const convertJourneyToShipPosition = (journey: Journey) => ({
    journeyId: journey.id,
    ship: journey.ship,
    progress: journey.progress,
    route: {
      origin: journey.originPort,
      destination: journey.destinationPort,
    },
    currentPosition: journey.positions?.[0] || null,
    status: journey.status,
    estimatedArrival: journey.estimatedArrival || '',
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-300 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <div className="p-6 text-center">
        <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          {showActiveOnly ? 'No Active Journeys' : 'No Journeys Found'}
        </h3>
        <p className="text-gray-500">
          {showActiveOnly 
            ? 'Create a new journey to start tracking ships'
            : 'Journey history will appear here once created'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-4">
        {journeys.map((journey) => (
          <Card key={journey.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ship className="h-5 w-5 text-blue-600" />
                    {journey.ship.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 font-mono">
                    {journey.ship.registrationNumber}
                  </p>
                </div>
                {getStatusBadge(journey.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Route Information */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-medium">{journey.originPort.name}</span>
                  <span className="text-gray-500">({journey.originPort.country})</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="font-medium">{journey.destinationPort.name}</span>
                  <span className="text-gray-500">({journey.destinationPort.country})</span>
                </div>
              </div>

              {/* Progress Bar */}
              {journey.status === 'in_progress' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span>{journey.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={journey.progress} className="h-2" />
                </div>
              )}

              {/* Journey Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Distance:</span> {formatDistance(journey.distance)}
                </div>
                <div>
                  <span className="font-medium">Speed:</span> {formatSpeed(journey.speed)}
                </div>
                <div>
                  <span className="font-medium">Departure:</span> {formatTime(journey.departureTime)}
                </div>
                <div>
                  <span className="font-medium">ETA:</span> {formatTime(journey.estimatedArrival)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onShipSelect(convertJourneyToShipPosition(journey))}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
                
                {journey.positions?.[0] && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCenterOnShip(convertJourneyToShipPosition(journey))}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Locate
                  </Button>
                )}

                {journey.status === 'planned' && (
                  <Button
                    size="sm"
                    onClick={() => handleStartJourney(journey.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                )}

                {['planned', 'in_progress'].includes(journey.status) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancelJourney(journey.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}