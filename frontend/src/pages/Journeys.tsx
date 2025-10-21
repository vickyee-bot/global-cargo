import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateJourneyModal } from '@/components/tracking/CreateJourneyModal';
import { useJourneys, startJourney, cancelJourney } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Plus, 
  Navigation, 
  MapPin, 
  Ship, 
  Play, 
  X, 
  Eye, 
  Clock,
  ArrowRight,
  Activity,
  CheckCircle,
  Calendar
} from 'lucide-react';

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

export default function Journeys() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  const { 
    data: journeysData = { data: [] }, 
    isLoading: journeysLoading,
    refetch: refetchJourneys 
  } = useJourneys({});

  const allJourneys = journeysData?.data || [];

  // Filter journeys by status
  const activeJourneys = allJourneys.filter(j => ['planned', 'in_progress'].includes(j.status));
  const completedJourneys = allJourneys.filter(j => j.status === 'completed');
  const cancelledJourneys = allJourneys.filter(j => j.status === 'cancelled');

  const handleStartJourney = async (journeyId: number) => {
    try {
      await startJourney(journeyId);
      toast.success('Journey started successfully!');
      refetchJourneys();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start journey');
    }
  };

  const handleCancelJourney = async (journeyId: number) => {
    if (!window.confirm('Are you sure you want to cancel this journey?')) return;
    
    try {
      await cancelJourney(journeyId);
      toast.success('Journey cancelled successfully!');
      refetchJourneys();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel journey');
    }
  };

  const handleJourneyCreated = () => {
    setIsCreateModalOpen(false);
    refetchJourneys();
    toast.success('Journey created successfully!');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planned: { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Planned', icon: Clock },
      in_progress: { color: 'bg-green-100 text-green-800 border-green-300', label: 'In Progress', icon: Activity },
      completed: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Completed', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelled', icon: X },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planned;
    const IconComponent = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
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

  // Stats calculation
  const stats = {
    total: allJourneys.length,
    active: activeJourneys.length,
    completed: completedJourneys.length,
    completedToday: completedJourneys.filter(j => {
      if (j.actualArrival) {
        const today = new Date().toDateString();
        return new Date(j.actualArrival).toDateString() === today;
      }
      return false;
    }).length
  };

  const JourneyTableRow = ({ journey }: { journey: Journey }) => (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center gap-3">
          <Ship className="h-4 w-4 text-blue-600" />
          <div>
            <div className="font-medium">{journey.ship.name}</div>
            <div className="text-xs text-gray-500 font-mono">{journey.ship.registrationNumber}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>{journey.originPort.name}</span>
          <ArrowRight className="h-3 w-3 text-gray-400" />
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span>{journey.destinationPort.name}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {journey.originPort.country} → {journey.destinationPort.country}
        </div>
      </TableCell>
      <TableCell>
        {getStatusBadge(journey.status)}
      </TableCell>
      <TableCell>
        {journey.status === 'in_progress' ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{journey.progress.toFixed(1)}%</div>
            <Progress value={journey.progress} className="h-1 w-20" />
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell className="text-sm">
        <div>{formatTime(journey.departureTime)}</div>
        {journey.estimatedArrival && (
          <div className="text-xs text-gray-500">ETA: {formatTime(journey.estimatedArrival)}</div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {journey.status === 'planned' && (
            <Button
              size="sm"
              onClick={() => handleStartJourney(journey.id)}
              className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/tracking?shipId=${journey.shipId}`)}
            className="h-7 px-2"
          >
            <MapPin className="h-3 w-3 mr-1" />
            Track
          </Button>

          {['planned', 'in_progress'].includes(journey.status) && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleCancelJourney(journey.id)}
              className="h-7 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  if (journeysLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading journeys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Navigation className="h-8 w-8 text-blue-600" />
            <span>Journey Management</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan, track, and manage ship journeys across your fleet
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Journey
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Journeys</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Navigation className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-orange-600">{stats.completedToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Tables */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Journeys ({allJourneys.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeJourneys.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedJourneys.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledJourneys.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Journeys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ship</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allJourneys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No journeys found. Create your first journey to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      allJourneys.map((journey) => (
                        <JourneyTableRow key={journey.id} journey={journey} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Journeys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ship</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeJourneys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No active journeys at the moment.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeJourneys.map((journey) => (
                        <JourneyTableRow key={journey.id} journey={journey} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Journeys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ship</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedJourneys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No completed journeys yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      completedJourneys.map((journey) => (
                        <JourneyTableRow key={journey.id} journey={journey} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Journeys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ship</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancelledJourneys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No cancelled journeys.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cancelledJourneys.map((journey) => (
                        <JourneyTableRow key={journey.id} journey={journey} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Journey Modal */}
      <CreateJourneyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onJourneyCreated={handleJourneyCreated}
      />
    </div>
  );
}