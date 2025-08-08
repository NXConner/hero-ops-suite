import React, { useState, useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Truck, 
  Cloud, 
  Activity, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Thermometer,
  Fuel,
  Wrench,
  Phone,
  Navigation,
  Settings,
  Plus,
  X as CloseIcon,
  Move,
  RotateCw,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  defaultSize: { w: number; h: number; minW?: number; minH?: number };
  category: 'tracking' | 'environment' | 'analysis' | 'mission' | 'alerts' | 'stats';
  description: string;
}

interface DraggableWidgetsProps {
  terminologyMode: 'military' | 'civilian' | 'both';
  isVisible: boolean;
  onLayoutChange?: (layout: Layout[]) => void;
}

const DraggableWidgets: React.FC<DraggableWidgetsProps> = ({ 
  terminologyMode, 
  isVisible, 
  onLayoutChange 
}) => {
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({});
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    'fleet-tracking',
    'weather-conditions',
    'pavement-analysis',
    'mission-status'
  ]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);

  const getTerminology = (military: string, civilian: string) => {
    switch (terminologyMode) {
      case 'military': return military;
      case 'civilian': return civilian;
      case 'both': return `${military} / ${civilian}`;
      default: return military;
    }
  };

  // Widget Components
  const FleetTrackingWidget = () => (
    <Card className="h-full bg-slate-900/95 border-cyan-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          {getTerminology('Asset Tracking', 'Fleet Tracking')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Active {getTerminology('Units', 'Vehicles')}</span>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">12</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">{getTerminology('Personnel', 'Employees')}</span>
          <Badge variant="outline" className="text-orange-400 border-orange-400">24</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300">Alerts</span>
          <Badge variant="destructive">2</Badge>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Fuel Avg</span>
            <span className="text-cyan-400">68%</span>
          </div>
          <Progress value={68} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );

  const WeatherWidget = () => (
    <Card className="h-full bg-slate-900/95 border-cyan-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          {getTerminology('Environmental Intel', 'Weather Conditions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <span className="text-slate-300">Temperature</span>
            <span className="text-orange-400 font-mono block">72°F</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-300">Humidity</span>
            <span className="text-cyan-400 font-mono block">65%</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-300">Wind</span>
            <span className="text-slate-300 font-mono block">8 mph NE</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-300">UV Index</span>
            <span className="text-yellow-400 font-mono block">6</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Thermometer className="w-3 h-3 text-orange-400" />
          <span className="text-xs text-green-400">Optimal for Operations</span>
        </div>
      </CardContent>
    </Card>
  );

  const PavementAnalysisWidget = () => (
    <Card className="h-full bg-slate-900/95 border-cyan-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          {getTerminology('Surface Intel', 'Pavement Analysis')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-lg font-mono text-cyan-400">8</div>
            <div className="text-xs text-slate-300">Scanned Areas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-orange-400">23</div>
            <div className="text-xs text-slate-300">Defects Found</div>
          </div>
        </div>
        <Separator className="bg-slate-600" />
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Critical Issues</span>
            <Badge variant="destructive" className="text-xs">3</Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Completion</span>
            <span className="text-cyan-400 font-mono">78%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MissionStatusWidget = () => (
    <Card className="h-full bg-slate-900/95 border-cyan-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <Target className="w-4 h-4" />
          {getTerminology('Mission Status', 'Project Status')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Active {getTerminology('Operations', 'Projects')}</span>
            <Badge variant="outline" className="text-green-400 border-green-400">5</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Overall Progress</span>
              <span className="text-cyan-400 font-mono">78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">ETA</span>
            <span className="text-orange-400 font-mono">14:30</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AlertsWidget = () => (
    <Card className="h-full bg-slate-900/95 border-cyan-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {getTerminology('Alert Center', 'Alert Center')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <div className="bg-red-500/20 border border-red-500/30 rounded p-2">
            <div className="text-xs text-red-400 font-semibold">HIGH PRIORITY</div>
            <div className="text-xs text-slate-300">Maintenance required: Paver-02</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded p-2">
            <div className="text-xs text-yellow-400 font-semibold">MEDIUM</div>
            <div className="text-xs text-slate-300">Phone usage: John Smith</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PerformanceWidget = () => (
    <Card className="h-full bg-slate-900/95 border-cyan-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="text-lg font-mono text-green-400">94%</div>
            <div className="text-slate-300">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-cyan-400">2.1hrs</div>
            <div className="text-slate-300">Avg Response</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-300">Daily Target</div>
          <Progress value={86} className="h-2" />
          <div className="text-xs text-cyan-400">86% Complete</div>
        </div>
      </CardContent>
    </Card>
  );

  // Widget Configuration
  const widgetConfigs: WidgetConfig[] = [
    {
      id: 'fleet-tracking',
      title: getTerminology('Asset Tracking', 'Fleet Tracking'),
      icon: <Users className="w-4 h-4" />,
      component: FleetTrackingWidget,
      defaultSize: { w: 4, h: 6, minW: 3, minH: 4 },
      category: 'tracking',
      description: 'Real-time vehicle and personnel tracking'
    },
    {
      id: 'weather-conditions',
      title: getTerminology('Environmental Intel', 'Weather Conditions'),
      icon: <Cloud className="w-4 h-4" />,
      component: WeatherWidget,
      defaultSize: { w: 4, h: 5, minW: 3, minH: 3 },
      category: 'environment',
      description: 'Current weather and environmental conditions'
    },
    {
      id: 'pavement-analysis',
      title: getTerminology('Surface Intel', 'Pavement Analysis'),
      icon: <Activity className="w-4 h-4" />,
      component: PavementAnalysisWidget,
      defaultSize: { w: 4, h: 5, minW: 3, minH: 3 },
      category: 'analysis',
      description: 'PavementScan Pro results and analysis'
    },
    {
      id: 'mission-status',
      title: getTerminology('Mission Status', 'Project Status'),
      icon: <Target className="w-4 h-4" />,
      component: MissionStatusWidget,
      defaultSize: { w: 4, h: 5, minW: 3, minH: 3 },
      category: 'mission',
      description: 'Current project status and progress'
    },
    {
      id: 'alerts',
      title: 'Alert Center',
      icon: <AlertTriangle className="w-4 h-4" />,
      component: AlertsWidget,
      defaultSize: { w: 4, h: 6, minW: 3, minH: 4 },
      category: 'alerts',
      description: 'System alerts and notifications'
    },
    {
      id: 'performance',
      title: 'Performance Metrics',
      icon: <TrendingUp className="w-4 h-4" />,
      component: PerformanceWidget,
      defaultSize: { w: 4, h: 5, minW: 3, minH: 3 },
      category: 'stats',
      description: 'Operational performance and efficiency metrics'
    }
  ];

  // Generate layouts for active widgets
  const generateLayout = (): Layout[] => {
    let yPosition = 0;
    return activeWidgets.map((widgetId, index) => {
      const config = widgetConfigs.find(w => w.id === widgetId);
      if (!config) return { i: widgetId, x: 0, y: 0, w: 4, h: 4 };
      
      const layout = {
        i: widgetId,
        x: (index % 3) * 4,
        y: yPosition,
        w: config.defaultSize.w,
        h: config.defaultSize.h,
        minW: config.defaultSize.minW || 2,
        minH: config.defaultSize.minH || 2
      };
      
      if ((index + 1) % 3 === 0) {
        yPosition += config.defaultSize.h;
      }
      
      return layout;
    });
  };

  const handleLayoutChange = (layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    setLayouts(layouts);
    onLayoutChange?.(layout);
  };

  const addWidget = (widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets(prev => [...prev, widgetId]);
    }
    setShowWidgetSelector(false);
  };

  const removeWidget = (widgetId: string) => {
    setActiveWidgets(prev => prev.filter(id => id !== widgetId));
  };

  const saveLayout = () => {
    localStorage.setItem('overwatch-layout', JSON.stringify(layouts));
    console.log('Layout saved');
  };

  const loadLayout = () => {
    const saved = localStorage.getItem('overwatch-layout');
    if (saved) {
      setLayouts(JSON.parse(saved));
      console.log('Layout loaded');
    }
  };

  const resetLayout = () => {
    setLayouts({});
    console.log('Layout reset');
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-4 right-4 z-[500] w-[400px]">
      {/* Widget Controls */}
      <Card className="mb-4 bg-slate-900/95 border-cyan-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
              <Move className="w-4 h-4" />
              Widget Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-1 ${isEditMode ? 'text-cyan-400' : 'text-slate-400'}`}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWidgetSelector(!showWidgetSelector)}
                className="text-slate-400 hover:text-cyan-400 p-1"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isEditMode && (
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveLayout}
                className="text-xs flex-1"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadLayout}
                className="text-xs flex-1"
              >
                <Upload className="w-3 h-3 mr-1" />
                Load
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetLayout}
                className="text-xs flex-1"
              >
                <RotateCw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          </CardContent>
        )}

        {showWidgetSelector && (
          <CardContent className="space-y-2">
            <Label className="text-xs text-cyan-400">Available Widgets:</Label>
            <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
              {widgetConfigs
                .filter(config => !activeWidgets.includes(config.id))
                .map(config => (
                  <Button
                    key={config.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addWidget(config.id)}
                    className="justify-start text-xs h-8"
                  >
                    {config.icon}
                    <span className="ml-2">{config.title}</span>
                  </Button>
                ))
              }
            </div>
          </CardContent>
        )}
      </Card>

      {/* Responsive Grid Layout */}
      <div className="w-full">
        <ResponsiveGridLayout
          className="layout"
          layouts={Object.keys(layouts).length > 0 ? layouts : { lg: generateLayout() }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={setCurrentBreakpoint}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          margin={[8, 8]}
          compactType="vertical"
          preventCollision={false}
        >
          {activeWidgets.map(widgetId => {
            const config = widgetConfigs.find(w => w.id === widgetId);
            if (!config) return null;

            const WidgetComponent = config.component;

            return (
              <div key={widgetId} className="relative">
                <WidgetComponent />
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWidget(widgetId)}
                    className="absolute top-1 right-1 z-10 p-1 text-red-400 hover:text-red-300 bg-slate-800/80"
                  >
                    <CloseIcon className="w-3 h-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default DraggableWidgets;