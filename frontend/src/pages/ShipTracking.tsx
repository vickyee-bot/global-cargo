import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useJourneys, useActiveShipPositions } from '@/lib/api';
import { 
  Navigation, 
  MapPin, 
  ArrowLeft,
  Activity,
  Target,
  Compass,
  Clock,
  Gauge
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Radar Animation Component
const RadarSweep = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="radar-sweep"></div>
    <style jsx>{`
      .radar-sweep {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2000px;
        height: 2000px;
        transform: translate(-50%, -50%);
        background: conic-gradient(
          from 0deg,
          transparent 0deg,
          rgba(34, 197, 94, 0.2) 30deg,
          rgba(34, 197, 94, 0.4) 45deg,
          rgba(34, 197, 94, 0.6) 50deg,
          rgba(34, 197, 94, 0.4) 55deg,
          rgba(34, 197, 94, 0.2) 70deg,
          transparent 90deg,
          transparent 360deg
        );
        border-radius: 50%;
        animation: radar-spin 4s linear infinite;
      }
      
      @keyframes radar-spin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `}</style>
  </div>
);

// Ship Icon Component
const ShipIcon = ({ ship, isSelected, onClick, shipNumber }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-green-500';
      case 'planned': return 'bg-yellow-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div 
      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
        isSelected ? 'scale-150 z-20' : 'scale-100 z-10'
      }`}
      onClick={() => onClick(ship)}
      style={{
        left: `${((ship.currentPosition.longitude + 180) / 360) * 100}%`,
        top: `${((90 - ship.currentPosition.latitude) / 180) * 100}%`
      }}
    >
      <div className={`relative ${getStatusColor(ship.status)} rounded-full p-3 shadow-lg border-2 ${
        isSelected ? 'border-white animate-pulse' : 'border-gray-700'
      }`}>
        <Navigation className="w-6 h-6 text-white" style={{
          transform: `rotate(${ship.currentPosition.heading || 0}deg)`
        }} />
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs font-mono">
          #{shipNumber}
        </div>
        {isSelected && (
          <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"></div>
        )}
      </div>
    </div>
  );
};

// Globe Map View Component
const GlobeMapView = ({ ships, selectedShip, onShipClick }) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900">
      {/* Earth-like background with continents */}
      <div className="absolute inset-0 opacity-60">
        <svg className="w-full h-full" viewBox="0 0 2000 1000" preserveAspectRatio="xMidYMid slice">
          {/* North America */}
          <path d="M200 200 Q300 180 450 200 Q500 250 480 300 Q400 350 300 320 Q200 280 200 200 Z" fill="#2d5a27" stroke="#4a7c59" strokeWidth="2" />
          {/* South America */}
          <path d="M350 450 Q380 420 420 450 Q430 500 415 580 Q390 650 360 630 Q340 550 350 450 Z" fill="#2d5a27" stroke="#4a7c59" strokeWidth="2" />
          {/* Europe */}
          <path d="M800 180 Q850 160 900 180 Q920 220 890 250 Q840 260 800 240 Q780 210 800 180 Z" fill="#2d5a27" stroke="#4a7c59" strokeWidth="2" />
          {/* Africa */}
          <path d="M850 280 Q900 260 950 300 Q960 400 920 480 Q880 450 850 400 Q840 340 850 280 Z" fill="#2d5a27" stroke="#4a7c59" strokeWidth="2" />
          {/* Asia */}
          <path d="M950 150 Q1200 120 1400 160 Q1450 200 1420 280 Q1300 320 1100 300 Q950 250 950 150 Z" fill="#2d5a27" stroke="#4a7c59" strokeWidth="2" />
          {/* Australia */}
          <path d="M1300 450 Q1400 430 1450 460 Q1440 500 1380 510 Q1320 490 1300 450 Z" fill="#2d5a27" stroke="#4a7c59" strokeWidth="2" />
          
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="100" height="50" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Ocean effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-900/20 to-blue-950/40"></div>
      
      {/* Ships on globe */}
      {ships.map((ship) => (
        <div
          key={ship.ship.id}
          className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
            selectedShip?.ship.id === ship.ship.id ? 'scale-125 z-20' : 'scale-100 z-10'
          }`}
          onClick={() => onShipClick(ship)}
          style={{
            left: `${((ship.currentPosition.longitude + 180) / 360) * 100}%`,
            top: `${((90 - ship.currentPosition.latitude) / 180) * 100}%`
          }}
        >
          <div className={`relative bg-white rounded-full p-2 shadow-xl border-2 ${
            selectedShip?.ship.id === ship.ship.id ? 'border-yellow-400 shadow-yellow-400/50' : 'border-blue-300'
          }`}>
            <Navigation className="w-4 h-4 text-blue-600" style={{
              transform: `rotate(${ship.currentPosition.heading || 0}deg)`
            }} />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
              {ship.ship.name}
            </div>
            {selectedShip?.ship.id === ship.ship.id && (
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping"></div>
            )}
          </div>
        </div>
      ))}
      
      {/* Route lines */}
      {ships.map((ship) => {
        if (!ship.route.origin.latitude || !ship.route.destination.latitude) return null;
        
        const startX = ((ship.route.origin.longitude + 180) / 360) * 100;
        const startY = ((90 - ship.route.origin.latitude) / 180) * 100;
        const endX = ((ship.route.destination.longitude + 180) / 360) * 100;
        const endY = ((90 - ship.route.destination.latitude) / 180) * 100;

        return (
          <svg key={`route-${ship.ship.id}`} className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id={`map-route-gradient-${ship.ship.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#10b981', stopOpacity: 1}} />
                <stop offset={`${ship.progress}%`} style={{stopColor: '#10b981', stopOpacity: 1}} />
                <stop offset={`${ship.progress}%`} style={{stopColor: '#6b7280', stopOpacity: 0.6}} />
                <stop offset="100%" style={{stopColor: '#6b7280', stopOpacity: 0.6}} />
              </linearGradient>
            </defs>
            <line
              x1={`${startX}%`}
              y1={`${startY}%`}
              x2={`${endX}%`}
              y2={`${endY}%`}
              stroke={`url(#map-route-gradient-${ship.ship.id})`}
              strokeWidth="3"
              strokeDasharray="10,5"
            />
            {/* Origin marker */}
            <circle cx={`${startX}%`} cy={`${startY}%`} r="6" fill="#10b981" stroke="white" strokeWidth="2" />
            {/* Destination marker */}
            <circle cx={`${endX}%`} cy={`${endY}%`} r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
          </svg>
        );
      })}
    </div>
  );
};

// Radar Map View Component
const RadarMapView = ({ ships, selectedShip, onShipClick }) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-gray-900 to-black">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Radar Sweep Animation */}
      <RadarSweep />
      
      {/* Simplified World Map Outline */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
        <path d="M150 200 L250 180 L300 220 L280 280 L180 290 Z" fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1"/>
        <path d="M320 180 L420 170 L450 200 L440 250 L380 270 L330 250 Z" fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1"/>
        <path d="M500 160 L600 150 L650 180 L630 230 L580 250 L520 240 Z" fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1"/>
      </svg>

      {/* Ships in radar style */}
      {ships.map((ship, index) => (
        <ShipIcon
          key={ship.ship.id}
          ship={ship}
          shipNumber={index + 1}
          isSelected={selectedShip?.ship.id === ship.ship.id}
          onClick={onShipClick}
        />
      ))}

      {/* Ship Routes in radar style */}
      {ships.map((ship) => {
        if (!ship.route.origin.latitude || !ship.route.destination.latitude) return null;
        
        const startX = ((ship.route.origin.longitude + 180) / 360) * 100;
        const startY = ((90 - ship.route.origin.latitude) / 180) * 100;
        const endX = ((ship.route.destination.longitude + 180) / 360) * 100;
        const endY = ((90 - ship.route.destination.latitude) / 180) * 100;

        return (
          <div key={`radar-route-${ship.ship.id}`} className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              <defs>
                <linearGradient id={`radar-route-gradient-${ship.ship.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: 'rgba(34, 197, 94, 0.8)', stopOpacity: 1}} />
                  <stop offset={`${ship.progress}%`} style={{stopColor: 'rgba(34, 197, 94, 0.8)', stopOpacity: 1}} />
                  <stop offset={`${ship.progress}%`} style={{stopColor: 'rgba(107, 114, 128, 0.5)', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: 'rgba(107, 114, 128, 0.5)', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              <line
                x1={`${startX}%`}
                y1={`${startY}%`}
                x2={`${endX}%`}
                y2={`${endY}%`}
                stroke={`url(#radar-route-gradient-${ship.ship.id})`}
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
              <circle cx={`${startX}%`} cy={`${startY}%`} r="4" fill="rgba(34, 197, 94, 0.8)" className="animate-pulse" />
              <circle cx={`${endX}%`} cy={`${endY}%`} r="4" fill="rgba(239, 68, 68, 0.8)" className="animate-pulse" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

// Ship Details Panel
const ShipDetailsPanel = ({ ship, onClose, viewMode }) => {
  if (!ship) return null;

  const panelStyle = viewMode === 'radar' 
    ? 'bg-black bg-opacity-90 backdrop-blur border border-green-500/30 text-white'
    : 'bg-white bg-opacity-95 backdrop-blur border border-blue-300 text-gray-900';
    
  const titleColor = viewMode === 'radar' ? 'text-green-400' : 'text-blue-600';
  const textColor = viewMode === 'radar' ? 'text-white' : 'text-gray-900';
  const subtitleColor = viewMode === 'radar' ? 'text-gray-300' : 'text-gray-600';
  const borderColor = viewMode === 'radar' ? 'border-gray-700' : 'border-gray-200';
  const progressColor = viewMode === 'radar' ? 'text-green-400' : 'text-blue-600';

  return (
    <div className={`absolute top-4 right-4 w-80 ${panelStyle} rounded-lg p-6 z-30`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${titleColor}`}>Ship #{ship.shipNumber}</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className={`${textColor} hover:bg-gray-${viewMode === 'radar' ? '800' : '100'}`}>
          ×
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className={`${titleColor} text-sm font-semibold mb-2`}>{ship.ship.name}</h4>
          <p className={`text-xs ${subtitleColor} font-mono`}>{ship.ship.registrationNumber}</p>
        </div>

        <div className={`border-t ${borderColor} pt-4`}>
          <h4 className={`${titleColor} text-sm font-semibold mb-2`}>Current Journey</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={subtitleColor}>Route:</span>
              <span className={textColor}>{ship.route.origin.name} → {ship.route.destination.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={subtitleColor}>Progress:</span>
              <span className={`${progressColor} font-semibold`}>{ship.progress.toFixed(1)}%</span>
            </div>
            <Progress value={ship.progress} className={`h-2 ${viewMode === 'radar' ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        </div>

        <div className={`border-t ${borderColor} pt-4`}>
          <h4 className={`${titleColor} text-sm font-semibold mb-2`}>Position Data</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className={subtitleColor}>Speed:</span>
              <div className={`${textColor} font-mono`}>{ship.currentPosition.speed?.toFixed(1) || '0.0'} kts</div>
            </div>
            <div>
              <span className={subtitleColor}>Heading:</span>
              <div className={`${textColor} font-mono`}>{ship.currentPosition.heading?.toFixed(0) || '0'}°</div>
            </div>
            <div>
              <span className={subtitleColor}>Lat:</span>
              <div className={`${textColor} font-mono`}>{ship.currentPosition.latitude.toFixed(4)}</div>
            </div>
            <div>
              <span className={subtitleColor}>Lon:</span>
              <div className={`${textColor} font-mono`}>{ship.currentPosition.longitude.toFixed(4)}</div>
            </div>
          </div>
        </div>

        {ship.estimatedArrival && (
          <div className={`border-t ${borderColor} pt-4`}>
            <div className="flex justify-between text-sm">
              <span className={subtitleColor}>ETA:</span>
              <span className={viewMode === 'radar' ? 'text-yellow-400' : 'text-orange-600'}>{new Date(ship.estimatedArrival).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ShipTracking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shipIdParam = searchParams.get('shipId');
  
  const [selectedShip, setSelectedShip] = useState(null);
  const [viewMode, setViewMode] = useState<'radar' | 'map'>('radar');

  // Only fetch journeys with active positions (ships that are actually moving)
  const { data: journeysData = { data: [] }, isLoading: journeysLoading } = useJourneys({});
  const { data: shipPositions = { data: [] }, isLoading: positionsLoading } = useActiveShipPositions();

  // Filter to only show ships with active journeys and positions
  const activeJourneysWithPositions = (shipPositions?.data || []).filter(ship => 
    ship.status === 'in_progress' && 
    ship.currentPosition &&
    ship.route
  );

  // Filter for specific ship if requested
  const filteredShips = shipIdParam 
    ? activeJourneysWithPositions.filter(s => s.ship.id === parseInt(shipIdParam))
    : activeJourneysWithPositions;

  // Add ship numbers
  const shipsWithNumbers = filteredShips.map((ship, index) => ({
    ...ship,
    shipNumber: index + 1
  }));

  // Auto-select ship if only one or if specific ship requested
  useEffect(() => {
    if (shipsWithNumbers.length === 1 && !selectedShip) {
      setSelectedShip(shipsWithNumbers[0]);
    }
    if (shipIdParam && shipsWithNumbers.length > 0 && !selectedShip) {
      setSelectedShip(shipsWithNumbers[0]);
    }
  }, [shipsWithNumbers, selectedShip, shipIdParam]);

  const handleShipClick = (ship) => {
    setSelectedShip(selectedShip?.ship.id === ship.ship.id ? null : ship);
  };

  if (journeysLoading || positionsLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-400 text-lg">Initializing tracking systems...</p>
        </div>
      </div>
    );
  }

  if (shipsWithNumbers.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Journeys</h2>
          <p className="text-gray-400 mb-6">No ships are currently on active journeys with position data.</p>
          <Button 
            onClick={() => navigate('/ships')}
            variant="outline"
            className="border-green-500 text-green-400 hover:bg-green-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Fleet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Radar Sweep Animation */}
      <RadarSweep />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur border-b border-green-500/30 p-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/ships')}
              className="text-green-400 hover:bg-green-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Fleet
            </Button>
            <div>
              <h1 className="text-xl font-bold text-green-400">
                {shipIdParam && shipsWithNumbers.length > 0 
                  ? `Tracking: ${shipsWithNumbers[0]?.ship?.name}`
                  : 'Global Tracking Center'
                }
              </h1>
              <p className="text-sm text-gray-400">
                {shipsWithNumbers.length} active journey{shipsWithNumbers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'radar' ? 'default' : 'ghost'}
                onClick={() => setViewMode('radar')}
                className={`h-8 px-3 ${viewMode === 'radar' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Target className="w-3 h-3 mr-1" />
                Radar
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                onClick={() => setViewMode('map')}
                className={`h-8 px-3 ${viewMode === 'map' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Map
              </Button>
            </div>
            
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
            <div className="text-xs text-gray-400 font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 pt-20">
        {viewMode === 'radar' ? (
          <RadarMapView 
            ships={shipsWithNumbers}
            selectedShip={selectedShip}
            onShipClick={handleShipClick}
          />
        ) : (
          <GlobeMapView 
            ships={shipsWithNumbers}
            selectedShip={selectedShip}
            onShipClick={handleShipClick}
          />
        )}
      </div>

      {/* Ship Details Panel */}
      <ShipDetailsPanel ship={selectedShip} onClose={() => setSelectedShip(null)} viewMode={viewMode} />

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur border-t border-green-500/30 p-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {shipsWithNumbers.map((ship, index) => (
              <div 
                key={ship.ship.id}
                className={`flex items-center space-x-2 cursor-pointer p-2 rounded ${
                  selectedShip?.ship.id === ship.ship.id ? 'bg-green-500/20' : 'hover:bg-gray-800'
                }`}
                onClick={() => handleShipClick(ship)}
              >
                <div className={`w-3 h-3 rounded-full ${
                  ship.status === 'in_progress' ? 'bg-green-500' : 'bg-yellow-500'
                } animate-pulse`} />
                <span className="text-sm font-mono text-white">#{ship.shipNumber}</span>
                <span className="text-xs text-gray-400">{ship.ship.name}</span>
                <span className="text-xs text-green-400">{ship.progress.toFixed(0)}%</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Compass className="w-4 h-4" />
              <span>Global Maritime Tracking</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>UTC {new Date().toISOString().substr(11, 8)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}