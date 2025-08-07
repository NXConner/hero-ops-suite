import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedThemeToggle } from "@/components/theme/AdvancedThemeToggle";
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Settings, 
  Shield,
  Menu,
  X,
  Bell,
  Search,
  Scan,
  Radar
} from "lucide-react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/dashboard"
    },
    {
      name: "OverWatch Map",
      href: "/overwatch",
      icon: Radar,
      current: location.pathname === "/overwatch",
      badge: "LIVE"
    },
    {
      name: "Mission Planning",
      href: "/mission-planning",
      icon: Target,
      current: location.pathname === "/mission-planning"
    },
    {
      name: "Team Management",
      href: "/team-management",
      icon: Users,
      current: location.pathname === "/team-management"
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      current: location.pathname === "/analytics"
    },
    {
      name: "Communications",
      href: "/communications",
      icon: MessageSquare,
      current: location.pathname === "/communications",
      badge: "3"
    },
    {
      name: "Intel Reports",
      href: "/intel-reports",
      icon: FileText,
      current: location.pathname === "/intel-reports"
    },
    {
      name: "PavementScan Pro",
      href: "/pavement-scan-pro",
      icon: Scan,
      current: location.pathname === "/pavement-scan-pro",
      badge: "NEW"
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location.pathname === "/settings"
    }
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-card/50 backdrop-blur-sm border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OverWatch
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                item.current
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="ml-3">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">System Status</div>
                <Badge variant="default" className="text-xs">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <AdvancedThemeToggle />
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <AdvancedThemeToggle />
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;