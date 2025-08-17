import { useEffect, useMemo, useState } from "react";
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
  X as CloseIcon,
  Bell,
  Search,
  Scan,
  Radar
} from "lucide-react";
import { useAdvancedTheme } from "@/contexts/AdvancedThemeContext";

interface NavItemConfig {
  name: string;
  href: string;
  icon: string; // icon key
  hidden?: boolean;
  badge?: string;
  parent?: string | null;
}

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Radar,
  Target,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  Scan,
  Shield,
  Settings
};

const defaultNav: NavItemConfig[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'OverWatch Map', href: '/overwatch', icon: 'Radar', badge: 'LIVE' },
  { name: 'Maps (All Features)', href: '/maps', icon: 'Radar' },
  { name: 'Mission Planning', href: '/mission-planning', icon: 'Target' },
  { name: 'Team Management', href: '/team-management', icon: 'Users' },
  { name: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { name: 'Communications', href: '/communications', icon: 'MessageSquare', badge: '3' },
  { name: 'Intel Reports', href: '/intel-reports', icon: 'FileText' },
  { name: 'Market Intel', href: '/intel-reports?tab=market', icon: 'FileText', parent: '/intel-reports' },
  { name: 'PavementScan Pro', href: '/pavement-scan-pro', icon: 'Scan', badge: 'NEW' },
  { name: 'Estimator', href: '/pavement-estimator', icon: 'Shield', badge: 'BETA' },
  { name: 'Fleet & Field Ops', href: '/fleet-field-ops', icon: 'LayoutDashboard', badge: 'BETA' },
  { name: 'Fleet Focus Manager', href: '/fleet-field-ops?app=fleet', icon: 'LayoutDashboard', parent: '/fleet-field-ops' },
  { name: 'Mobile Companion', href: '/mobile-companion', icon: 'LayoutDashboard', badge: 'WEB' },
  { name: 'Settings', href: '/settings', icon: 'Settings' }
];

function useNavConfig() {
  const [config, setConfig] = useState<NavItemConfig[]>(() => {
    try {
      const raw = localStorage.getItem('sidebar-nav-config');
      return raw ? JSON.parse(raw) : defaultNav;
    } catch {
      return defaultNav;
    }
  });

  useEffect(() => {
    try { localStorage.setItem('sidebar-nav-config', JSON.stringify(config)); } catch { /* ignore */ }
  }, [config]);

  return { config, setConfig } as const;
}

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { config } = useNavConfig();
  const { isVeteran, veteranBranch, setLowPower, lowPowerMode } = useAdvancedTheme();

  const navigation = useMemo(() => config.filter(i => !i.hidden), [config]);

  const topLevel = navigation.filter(n => !n.parent);
  const childrenOf = (parentHref: string) => navigation.filter(n => n.parent === parentHref);

  // Proportional width: clamp(min, preferred vw, max)
  const computedWidth = useMemo(() => (
    isCollapsed ? 'clamp(3rem, 4vw, 4rem)' : 'clamp(14rem, 18vw, 22rem)'
  ), [isCollapsed]);

  return (
    <>
      {/* Spacer to reserve layout width in flex container */}
      <div aria-hidden className="shrink-0" style={{ width: computedWidth, minWidth: computedWidth }} />
      {/* Fixed overlay sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-[1500] h-screen bg-card/80 backdrop-blur-sm border-r border-border transition-all duration-300"
      )} style={{ width: computedWidth }}>
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => (window as any).owEffects?.set?.({ minimal: true })}
              >Minimal</Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => (window as any).owEffects?.set?.({ minimal: false })}
              >Full</Button>
              <Button
                variant={lowPowerMode ? "default" : "outline"}
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => setLowPower(!lowPowerMode)}
              >{lowPowerMode ? 'Low Power On' : 'Low Power Off'}</Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8"
              >
                {isCollapsed ? <Menu className="h-4 w-4" /> : <CloseIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2">
            {topLevel.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const current = location.pathname === item.href;
              const children = childrenOf(item.href);
              return (
                <div key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                      current
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
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
                  {!isCollapsed && children.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {children.map((child) => {
                        const CIcon = iconMap[child.icon] || LayoutDashboard;
                        const isCurrent = location.pathname === child.href;
                        return (
                          <Link key={child.href} to={child.href} className={cn(
                            "flex items-center px-3 py-1.5 text-xs rounded-md",
                            isCurrent ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          )}>
                            <CIcon className="h-4 w-4" />
                            <span className="ml-2">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
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
                {isVeteran && (
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">Veteran</div>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {veteranBranch || 'Verified'}
                    </Badge>
                  </div>
                )}
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
    </>
  );
};

export default Sidebar;