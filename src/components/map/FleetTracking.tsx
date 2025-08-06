import React, { useState, useEffect, useRef } from 'react';
import { Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Users, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Phone, 
  Navigation, 
  Fuel,
  Wrench,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import L from 'leaflet';

interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'paver' | 'roller' | 'equipment';
  location: {
    lat: number;
    lng: number;
    heading: number;
    speed: number;
    altitude?: number;
  };
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  driver?: Employee;
  lastUpdate: Date;
  geofence?: {
    center: [number, number];
    radius: number;
    alertOnExit: boolean;
  };
  fuel?: number;
  maintenance?: {
    nextService: Date;
    hoursUntilService: number;
  };
}

interface Employee {
  id: string;
  name: string;
  role: string;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  status: 'clocked-in' | 'clocked-out' | 'break' | 'out-of-bounds';
  phoneUsage?: {
    isUsingPhone: boolean;
    nonWorkUsage: number; // minutes
    appUsage: number; // minutes with Blacktop Blackout app active
  };
  lastUpdate: Date;
}

interface Alert {
  id: string;
  type: 'geofence' | 'phone-usage' | 'maintenance' | 'speed' | 'offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  assetId: string;
}

interface HistoricalPosition {
  lat: number;
  lng: number;
  timestamp: Date;
  speed: number;
  activity: 'driving' | 'stationary' | 'walking';
}

interface FleetTrackingProps {
  terminologyMode: 'military' | 'civilian' | 'both';
  isVisible: boolean;
}

const FleetTracking: React.FC<FleetTrackingProps> = ({ terminologyMode, isVisible }) => {
  const map = useMap();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);
  const [playbackDate, setPlaybackDate] = useState<Date>(new Date());
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showTrails, setShowTrails] = useState(false);

  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getTerminology = (military: string, civilian: string) => {
    switch (terminologyMode) {
      case 'military': return military;
      case 'civilian': return civilian;
      case 'both': return `${military} / ${civilian}`;
      default: return military;
    }
  };

  // Mock data generation
  useEffect(() => {
    const generateMockVehicles = (): Vehicle[] => [
      {
        id: 'v1',
        name: getTerminology('Alpha-1', 'Truck-01'),
        type: 'truck',
        location: { lat: 40.7128, lng: -74.0060, heading: 45, speed: 25 },
        status: 'active',
        driver: {
          id: 'e1',
          name: 'John Smith',
          role: getTerminology('Operator', 'Driver'),
          location: { lat: 40.7128, lng: -74.0060, accuracy: 5 },
          status: 'clocked-in',
          phoneUsage: { isUsingPhone: false, nonWorkUsage: 12, appUsage: 45 },
          lastUpdate: new Date()
        },
        lastUpdate: new Date(),
        geofence: {
          center: [40.7128, -74.0060],
          radius: 500,
          alertOnExit: true
        },
        fuel: 75,
        maintenance: {
          nextService: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          hoursUntilService: 168
        }
      },
      {
        id: 'v2',
        name: getTerminology('Bravo-2', 'Paver-02'),
        type: 'paver',
        location: { lat: 40.7200, lng: -74.0100, heading: 90, speed: 15 },
        status: 'active',
        lastUpdate: new Date(),
        fuel: 45,
        maintenance: {
          nextService: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          hoursUntilService: 72
        }
      },
      {
        id: 'v3',
        name: getTerminology('Charlie-3', 'Roller-03'),
        type: 'roller',
        location: { lat: 40.7150, lng: -74.0020, heading: 180, speed: 0 },
        status: 'idle',
        lastUpdate: new Date(),
        fuel: 60
      }
    ];

    const generateMockEmployees = (): Employee[] => [
      {
        id: 'e2',
        name: 'Mike Johnson',
        role: getTerminology('Field Commander', 'Site Supervisor'),
        location: { lat: 40.7140, lng: -74.0050, accuracy: 3 },
        status: 'clocked-in',
        phoneUsage: { isUsingPhone: true, nonWorkUsage: 8, appUsage: 30 },
        lastUpdate: new Date()
      },
      {
        id: 'e3',
        name: 'Sarah Davis',
        role: getTerminology('Intel Specialist', 'Quality Inspector'),
        location: { lat: 40.7160, lng: -74.0080, accuracy: 4 },
        status: 'clocked-in',
        phoneUsage: { isUsingPhone: false, nonWorkUsage: 3, appUsage: 60 },
        lastUpdate: new Date()
      }
    ];

    const generateMockAlerts = (): Alert[] => [
      {
        id: 'a1',
        type: 'phone-usage',
        severity: 'medium',
        message: 'Excessive non-work phone usage detected for John Smith',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        acknowledged: false,
        assetId: 'e1'
      },
      {
        id: 'a2',
        type: 'maintenance',
        severity: 'high',
        message: getTerminology('Bravo-2', 'Paver-02') + ' requires service in 72 hours',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false,
        assetId: 'v2'
      }
    ];

    setVehicles(generateMockVehicles());
    setEmployees(generateMockEmployees());
    setAlerts(generateMockAlerts());
  }, [terminologyMode]);

  // Real-time updates simulation
  useEffect(() => {
    if (!isPlaybackMode) {
      const interval = setInterval(() => {
        setVehicles(prev => prev.map(vehicle => ({
          ...vehicle,
          location: {
            ...vehicle.location,
            lat: vehicle.location.lat + (Math.random() - 0.5) * 0.001,
            lng: vehicle.location.lng + (Math.random() - 0.5) * 0.001,
            speed: Math.max(0, vehicle.location.speed + (Math.random() - 0.5) * 10)
          },
          lastUpdate: new Date()
        })));

        setEmployees(prev => prev.map(employee => ({
          ...employee,
          location: {
            ...employee.location,
            lat: employee.location.lat + (Math.random() - 0.5) * 0.0005,
            lng: employee.location.lng + (Math.random() - 0.5) * 0.0005
          },
          lastUpdate: new Date()
        })));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isPlaybackMode]);

  const getStatusColor = (status: Vehicle['status'] | Employee['status']) => {
    switch (status) {
      case 'active':
      case 'clocked-in':
        return 'text-green-400 border-green-400';
      case 'idle':
      case 'break':
        return 'text-yellow-400 border-yellow-400';
      case 'maintenance':
      case 'out-of-bounds':
        return 'text-red-400 border-red-400';
      case 'offline':
      case 'clocked-out':
        return 'text-slate-400 border-slate-400';
      default:
        return 'text-slate-400 border-slate-400';
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-400 border-blue-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'high': return 'text-orange-400 border-orange-400';
      case 'critical': return 'text-red-400 border-red-400';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  const getVehicleIcon = (vehicle: Vehicle) => {
    const color = vehicle.status === 'active' ? '#10b981' : 
                  vehicle.status === 'idle' ? '#f59e0b' : 
                  vehicle.status === 'maintenance' ? '#ef4444' : '#6b7280';
    
    const iconSvg = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 17h14l-1.5-6H6.5L5 17zm7-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v7c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-7l-2.08-5.99z"/>
      </svg>
    `;

    return L.divIcon({
      html: iconSvg,
      className: 'vehicle-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const getEmployeeIcon = (employee: Employee) => {
    const color = employee.status === 'clocked-in' ? '#10b981' : 
                  employee.status === 'break' ? '#f59e0b' : 
                  employee.status === 'out-of-bounds' ? '#ef4444' : '#6b7280';
    
    const iconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="4"/>
        <path d="M12 14c-6.67 0-8 2.33-8 4v2h16v-2c0-1.67-1.33-4-8-4z"/>
      </svg>
    `;

    return L.divIcon({
      html: iconSvg,
      className: 'employee-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const startPlayback = () => {
    setIsPlaybackMode(true);
    setIsPlaying(true);
    
    playbackIntervalRef.current = setInterval(() => {
      // Simulate historical movement
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        location: {
          ...vehicle.location,
          lat: vehicle.location.lat + (Math.random() - 0.5) * 0.002,
          lng: vehicle.location.lng + (Math.random() - 0.5) * 0.002
        }
      })));
    }, 1000 / playbackSpeed);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
  };

  const resetPlayback = () => {
    setIsPlaybackMode(false);
    setIsPlaying(false);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Vehicle Markers */}
      {vehicles.map(vehicle => (
        <Marker
          key={vehicle.id}
          position={[vehicle.location.lat, vehicle.location.lng]}
          icon={getVehicleIcon(vehicle)}
        >
          <Popup className="custom-popup">
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{vehicle.name}</h3>
                <Badge variant="outline" className={getStatusColor(vehicle.status)}>
                  {vehicle.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>{vehicle.location.lat.toFixed(4)}, {vehicle.location.lng.toFixed(4)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3" />
                  <span>{vehicle.location.speed.toFixed(1)} mph, {vehicle.location.heading}°</span>
                </div>
                {vehicle.fuel && (
                  <div className="flex items-center gap-2">
                    <Fuel className="w-3 h-3" />
                    <Progress value={vehicle.fuel} className="flex-1 h-2" />
                    <span>{vehicle.fuel}%</span>
                  </div>
                )}
                {vehicle.driver && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    <span>{vehicle.driver.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Updated {vehicle.lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="w-full mt-2"
                onClick={() => setSelectedAsset(vehicle.id)}
              >
                View Details
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Employee Markers */}
      {employees.map(employee => (
        <Marker
          key={employee.id}
          position={[employee.location.lat, employee.location.lng]}
          icon={getEmployeeIcon(employee)}
        >
          <Popup className="custom-popup">
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                <Badge variant="outline" className={getStatusColor(employee.status)}>
                  {employee.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>{employee.location.lat.toFixed(4)}, {employee.location.lng.toFixed(4)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  <span>{employee.role}</span>
                </div>
                {employee.phoneUsage && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span className={employee.phoneUsage.isUsingPhone ? 'text-yellow-600' : 'text-green-600'}>
                        {employee.phoneUsage.isUsingPhone ? 'Using Phone' : 'Not Using Phone'}
                      </span>
                    </div>
                    <div className="text-xs pl-5">
                      Non-work: {employee.phoneUsage.nonWorkUsage}m | App: {employee.phoneUsage.appUsage}m
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Updated {employee.lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="w-full mt-2"
                onClick={() => setSelectedAsset(employee.id)}
              >
                View Details
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Geofences */}
      {showGeofences && vehicles.map(vehicle => 
        vehicle.geofence && (
          <Circle
            key={`geofence-${vehicle.id}`}
            center={vehicle.geofence.center}
            radius={vehicle.geofence.radius}
            pathOptions={{
              color: '#06b6d4',
              fillColor: '#06b6d4',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
        )
      )}
    </>
  );
};

export default FleetTracking;