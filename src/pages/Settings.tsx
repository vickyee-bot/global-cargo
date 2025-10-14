import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, User, Bell, Shield, Database } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <span>System Settings</span>
        </h1>
        <p className="text-muted-foreground">Configure system preferences and options</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>User Management</span>
            </CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-accent" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Configure system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Configure Notifications
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-success" />
              <span>Security</span>
            </CardTitle>
            <CardDescription>
              Security settings and access control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Security Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-warning" />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>
              Backup, export, and data management options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Data Options
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}