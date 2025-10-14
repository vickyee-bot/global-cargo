import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, Filter, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Crew() {
  const crewMembers = [
    {
      id: "CR-001",
      name: "Captain James Smith",
      role: "Captain",
      ship: "Ocean Explorer",
      experience: "15 years",
      certifications: ["Master Mariner", "STCW"],
      status: "Active",
      contact: "+1-555-0123"
    },
    {
      id: "CR-002",
      name: "First Officer Maria Garcia",
      role: "First Officer", 
      ship: "Atlantic Voyager",
      experience: "8 years",
      certifications: ["Chief Officer", "STCW"],
      status: "Active",
      contact: "+1-555-0124"
    },
    {
      id: "CR-003",
      name: "Engineer David Chen",
      role: "Chief Engineer",
      ship: "Pacific Dawn",
      experience: "12 years", 
      certifications: ["Chief Engineer", "STCW"],
      status: "On Leave",
      contact: "+1-555-0125"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success text-success-foreground";
      case "On Leave":
        return "bg-warning text-warning-foreground";
      case "Inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Captain":
        return "bg-primary text-primary-foreground";
      case "First Officer":
        return "bg-accent text-accent-foreground";
      case "Chief Engineer":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Users className="w-6 h-6 text-primary" />
            <span>Crew Management</span>
          </h1>
          <p className="text-muted-foreground">Manage crew members and assignments</p>
        </div>
        <Button className="bg-gradient-ocean text-primary-foreground shadow-ocean hover:shadow-elevated">
          <Plus className="w-4 h-4 mr-2" />
          Add Crew Member
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search crew by name, role, or ship..." 
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
        {crewMembers.map((member) => (
          <Card key={member.id} className="shadow-card hover:shadow-elevated transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-ocean rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {member.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Assigned Ship:</span>
                <p className="font-medium">{member.ship}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Experience:</span>
                <p className="font-medium">{member.experience}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Contact:</span>
                <p className="font-medium">{member.contact}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Certifications:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2 pt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  View Profile
                </Button>
                <Button size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}