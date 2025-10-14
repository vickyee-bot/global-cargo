import { 
  Ship, 
  Users, 
  Package, 
  MapPin, 
  Truck, 
  Building2, 
  BarChart3,
  Settings
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Ships", url: "/ships", icon: Ship },
  { title: "Crew", url: "/crew", icon: Users },
  { title: "Clients", url: "/clients", icon: Building2 },
  { title: "Cargo", url: "/cargo", icon: Package },
  { title: "Shipments", url: "/shipments", icon: Truck },
  { title: "Ports", url: "/ports", icon: MapPin },
];

const secondaryItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    const baseClass = "w-full justify-start transition-all duration-200";
    if (isActive(path)) {
      return `${baseClass} bg-primary text-primary-foreground shadow-md`;
    }
    return `${baseClass} hover:bg-muted text-muted-foreground hover:text-foreground`;
  };

  return (
    <Sidebar
      className="bg-gradient-horizon border-r border-border"
      collapsible="icon"
    >
      <SidebarContent className="p-4">
        {/* Logo/Header */}
        <div className="mb-6">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-ocean rounded-lg flex items-center justify-center">
                <Ship className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">CargoVoyage</h2>
                <p className="text-xs text-muted-foreground">Control Center</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-ocean rounded-lg flex items-center justify-center mx-auto">
              <Ship className="w-6 h-6 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Management
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass(item.url)}>
                      <item.icon className={`${isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup className="mt-8">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              System
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass(item.url)}>
                      <item.icon className={`${isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3"}`} />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}