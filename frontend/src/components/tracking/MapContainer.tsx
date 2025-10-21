import React, { useEffect, useRef } from 'react';
import { Ship, MapPin, Navigation, Activity } from 'lucide-react';

interface ShipPosition {
  journeyId: number;
  ship: {
    id: number;
    name: string;
    registrationNumber: string;
    type: string;
    status: string;
  };
  progress: number;
  route: {
    origin: {
      name: string;
      latitude: number;
      longitude: number;
    };
    destination: {
      name: string;
      latitude: number;
      longitude: number;
    };
  };
  currentPosition: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    timestamp: string;
  } | null;
  status: string;
  estimatedArrival: string;
}

interface MapContainerProps {
  ships: ShipPosition[];
  center: [number, number];
  zoom: number;
  onShipClick: (ship: ShipPosition) => void;
  selectedShip: ShipPosition | null;
  isLoading: boolean;
}

// Simple SVG-based map component (since we can't use external map libraries easily)
export function MapContainer({ ships, center, zoom, onShipClick, selectedShip, isLoading }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = React.useState('-180 -90 360 180');

  // Convert lat/lng to SVG coordinates
  const projectToSVG = (lat: number, lng: number) => {
    // Simple equirectangular projection
    const x = lng;
    const y = -lat; // Flip Y axis for SVG
    return { x, y };
  };

  // Calculate view box based on center and zoom
  useEffect(() => {
    const [centerLat, centerLng] = center;
    const scale = Math.pow(2, zoom - 2); // Adjust scale based on zoom
    const width = 360 / scale;
    const height = 180 / scale;
    
    const left = centerLng - width / 2;
    const top = -centerLat - height / 2; // Flip Y for SVG
    
    setViewBox(`${left} ${top} ${width} ${height}`);
  }, [center, zoom]);

  const getShipStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return '#10B981'; // Green
      case 'planned':
        return '#F59E0B'; // Orange
      case 'completed':
        return '#6B7280'; // Gray
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return '#3B82F6'; // Blue
    }
  };

  const getShipIcon = (ship: ShipPosition) => {
    const position = ship.currentPosition;
    if (!position) return null;

    const svgPos = projectToSVG(position.latitude, position.longitude);
    const isSelected = selectedShip?.journeyId === ship.journeyId;
    const color = getShipStatusColor(ship.status);

    return (
      <g
        key={ship.journeyId}
        onClick={() => onShipClick(ship)}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        transform={`translate(${svgPos.x}, ${svgPos.y})`}
      >
        {/* Ship marker */}
        <circle
          cx="0"
          cy="0"
          r={isSelected ? "3" : "2"}
          fill={color}
          stroke="white"
          strokeWidth={isSelected ? "2" : "1"}
        />
        
        {/* Selection ring */}
        {isSelected && (
          <circle
            cx="0"
            cy="0"
            r="6"
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="animate-pulse"
          />
        )}

        {/* Direction indicator */}
        {position.heading && (
          <line
            x1="0"
            y1="0"
            x2={Math.sin((position.heading * Math.PI) / 180) * 4}
            y2={-Math.cos((position.heading * Math.PI) / 180) * 4}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
      </g>
    );
  };

  const getRouteLines = () => {
    return ships
      .filter(ship => ship.currentPosition)
      .map(ship => {
        const origin = projectToSVG(ship.route.origin.latitude, ship.route.origin.longitude);
        const destination = projectToSVG(ship.route.destination.latitude, ship.route.destination.longitude);
        const current = projectToSVG(ship.currentPosition!.latitude, ship.currentPosition!.longitude);
        
        const color = getShipStatusColor(ship.status);
        const isSelected = selectedShip?.journeyId === ship.journeyId;

        return (
          <g key={`route-${ship.journeyId}`}>
            {/* Planned route (dashed) */}
            <line
              x1={origin.x}
              y1={origin.y}
              x2={destination.x}
              y2={destination.y}
              stroke={color}
              strokeWidth={isSelected ? "2" : "1"}
              strokeDasharray="5,5"
              opacity="0.5"
            />
            
            {/* Completed route (solid) */}
            <line
              x1={origin.x}
              y1={origin.y}
              x2={current.x}
              y2={current.y}
              stroke={color}
              strokeWidth={isSelected ? "3" : "2"}
              opacity="0.8"
            />

            {/* Origin port */}
            <circle
              cx={origin.x}
              cy={origin.y}
              r="2"
              fill="#3B82F6"
              stroke="white"
              strokeWidth="1"
            />

            {/* Destination port */}
            <circle
              cx={destination.x}
              cy={destination.y}
              r="2"
              fill="#EF4444"
              stroke="white"
              strokeWidth="1"
            />
          </g>
        );
      });
  };

  return (
    <div className="relative w-full h-full bg-blue-50">
      {/* World Map SVG */}
      <svg
        ref={mapRef}
        className="w-full h-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Simple world map background */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
          </pattern>
        </defs>
        
        <rect width="360" height="180" x="-180" y="-90" fill="url(#grid)" />
        
        {/* Continental outlines (simplified) */}
        <g fill="none" stroke="#9CA3AF" strokeWidth="0.5">
          {/* These would be actual continent paths in a real implementation */}
          <rect x="-180" y="-90" width="360" height="180" fill="#F0F9FF" />
          <rect x="-150" y="20" width="80" height="50" fill="#10B981" opacity="0.2" /> {/* North America */}
          <rect x="-80" y="-30" width="60" height="60" fill="#10B981" opacity="0.2" /> {/* South America */}
          <rect x="-20" y="30" width="70" height="40" fill="#10B981" opacity="0.2" /> {/* Europe */}
          <rect x="-20" y="-20" width="60" height="50" fill="#10B981" opacity="0.2" /> {/* Africa */}
          <rect x="60" y="10" width="80" height="50" fill="#10B981" opacity="0.2" /> {/* Asia */}
          <rect x="120" y="-40" width="40" height="30" fill="#10B981" opacity="0.2" /> {/* Australia */}
        </g>

        {/* Ship routes */}
        {getRouteLines()}

        {/* Ship positions */}
        {ships.map(ship => getShipIcon(ship))}
      </svg>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold text-sm mb-3">Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Planned</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Origin Port</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Destination Port</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-gray-400" style={{ borderStyle: 'dashed' }}></div>
            <span>Planned Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-green-500"></div>
            <span>Completed Route</span>
          </div>
        </div>
      </div>

      {/* Ship Count */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <Ship className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-sm">
            {ships.length} Active {ships.length === 1 ? 'Ship' : 'Ships'}
          </span>
        </div>
      </div>

      {/* No ships message */}
      {!isLoading && ships.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Ships</h3>
            <p className="text-gray-500">Create a journey to start tracking ships</p>
          </div>
        </div>
      )}
    </div>
  );
}