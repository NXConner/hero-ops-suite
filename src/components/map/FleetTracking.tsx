// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { gpsTrackingService, GPSTrackingResponse } from '@/services/api';
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
  const [realTimeData, setRealTimeData] = useState<GPSTrackingResponse[]>([]);
  const [isConnectedToAPI, setIsConnectedToAPI] = useState(false);

  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const markersRef = useRef<any[]>([]);

  const getTerminology = (military: string, civilian: string) => {
    switch (terminologyMode) {
      case 'military': return military;
      case 'civilian': return civilian;
      case 'both': return `${military} / ${civilian}`;
      default: return military;
    }
  };

  // Real GPS tracking integration
  useEffect(() => {
    if (!isVisible) return;

    const loadFleetData = async () => {
      try {
        // Try to get real GPS data first
        const gpsData = await gpsTrackingService.getDeviceLocations();
        if (gpsData && gpsData.length > 0) {
          setRealTimeData(gpsData);
          setIsConnectedToAPI(true);
          
          // Convert GPS data to vehicle format
          const vehiclesFromGPS = gpsData
            .filter(device => device.vehicle)
            .map(device => convertGPSToVehicle(device));
          
          const employeesFromGPS = gpsData
            .filter(device => !device.vehicle && device.driver)
            .map(device => convertGPSToEmployee(device));

          if (vehiclesFromGPS.length > 0) setVehicles(vehiclesFromGPS);
          if (employeesFromGPS.length > 0) setEmployees(employeesFromGPS);
        } else {
          throw new Error('No real GPS data available');
        }
      } catch (error) {
        console.log('Using mock data fallback:', error);
        setIsConnectedToAPI(false);
        // Fall back to enhanced mock data
        setVehicles(generateEnhancedMockVehicles());
        setEmployees(generateEnhancedMockEmployees());
        setAlerts(generateMockAlerts());
      }
    };

    loadFleetData();

    // Set up real-time updates
    const handleRealTimeUpdate = (data: GPSTrackingResponse[]) => {
      setRealTimeData(data);
      
      const vehiclesFromGPS = data
        .filter(device => device.vehicle)
        .map(device => convertGPSToVehicle(device));
      
      const employeesFromGPS = data
        .filter(device => !device.vehicle && device.driver)
        .map(device => convertGPSToEmployee(device));

      if (vehiclesFromGPS.length > 0) setVehicles(vehiclesFromGPS);
      if (employeesFromGPS.length > 0) setEmployees(employeesFromGPS);
    };

    gpsTrackingService.subscribeToRealTimeUpdates(handleRealTimeUpdate);

    return () => {
      gpsTrackingService.unsubscribeFromRealTimeUpdates(handleRealTimeUpdate);
    };
  }, [isVisible, terminologyMode]);

  // Convert GPS data to vehicle format
  const convertGPSToVehicle = (gpsData: GPSTrackingResponse): Vehicle => {
    return {
      id: gpsData.deviceId,
      name: gpsData.vehicle?.id || gpsData.deviceId,
      type: (gpsData.vehicle?.type as Vehicle['type']) || 'truck',
      location: {
        lat: gpsData.location.latitude,
        lng: gpsData.location.longitude,
        heading: gpsData.location.heading,
        speed: gpsData.location.speed,
        altitude: gpsData.location.altitude
      },
      status: gpsData.status === 'active' ? 'active' : 
               gpsData.status === 'idle' ? 'idle' : 'offline',
      driver: gpsData.driver ? {
        id: gpsData.driver.id,
        name: gpsData.driver.name,
        role: 'Driver',
        location: {
          lat: gpsData.location.latitude,
          lng: gpsData.location.longitude,
          accuracy: gpsData.location.accuracy
        },
        status: 'clocked-in',
        lastUpdate: new Date(gpsData.timestamp)
      } : undefined,
      lastUpdate: new Date(gpsData.timestamp),
      fuel: gpsData.batteryLevel ? Math.floor(gpsData.batteryLevel) : undefined,
      geofence: {
        center: [gpsData.location.latitude, gpsData.location.longitude],
        radius: 500,
        alertOnExit: true
      }
    };
  };

  // Convert GPS data to employee format
  const convertGPSToEmployee = (gpsData: GPSTrackingResponse): Employee => {
    return {
      id: gpsData.deviceId,
      name: gpsData.driver?.name || 'Unknown Employee',
      role: 'Field Worker',
      location: {
        lat: gpsData.location.latitude,
        lng: gpsData.location.longitude,
        accuracy: gpsData.location.accuracy
      },
      status: gpsData.isMoving ? 'clocked-in' : 
               gpsData.status === 'idle' ? 'break' : 'clocked-out',
      phoneUsage: {
        isUsingPhone: false, // Would need additional data source
        nonWorkUsage: Math.floor(Math.random() * 30),
        appUsage: Math.floor(Math.random() * 120)
      },
      lastUpdate: new Date(gpsData.timestamp)
    };
  };

  // Enhanced mock data for fallback
  const generateEnhancedMockVehicles = (): Vehicle[] => [
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

  const generateEnhancedMockEmployees = (): Employee[] => [
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

  // Real-time updates for mock data when not connected to API
  useEffect(() => {
    if (!isPlaybackMode && !isConnectedToAPI) {
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
  }, [isPlaybackMode, isConnectedToAPI]);

  // Add markers to map
  useEffect(() => {
    if (!isVisible || typeof window === 'undefined' || !(window as any).mapMethods) return;

    const mapMethods = (window as any).mapMethods;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add vehicle markers
    vehicles.forEach(vehicle => {
      const marker = mapMethods.addMarker(
        vehicle.location.lng,
        vehicle.location.lat,
        {
          color: vehicle.status === 'active' ? '#10b981' : 
                 vehicle.status === 'idle' ? '#f59e0b' : 
                 vehicle.status === 'maintenance' ? '#ef4444' : '#6b7280',
          popup: `
            <div class="p-2 min-w-[200px]">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold">${vehicle.name}</h3>
                <span class="px-2 py-1 text-xs rounded border ${getStatusColorClass(vehicle.status)}">
                  ${vehicle.status.toUpperCase()}
                </span>
              </div>
              <div class="space-y-1 text-xs">
                <div>📍 ${vehicle.location.lat.toFixed(4)}, ${vehicle.location.lng.toFixed(4)}</div>
                <div>🧭 ${vehicle.location.speed.toFixed(1)} mph, ${vehicle.location.heading}°</div>
                ${vehicle.fuel ? `<div>⛽ Fuel: ${vehicle.fuel}%</div>` : ''}
                ${vehicle.driver ? `<div>👤 ${vehicle.driver.name}</div>` : ''}
                <div>🕒 Updated ${vehicle.lastUpdate.toLocaleTimeString()}</div>
              </div>
            </div>
          `
        }
      );
      if (marker) markersRef.current.push(marker);
    });

    // Add employee markers
    employees.forEach(employee => {
      const marker = mapMethods.addMarker(
        employee.location.lng,
        employee.location.lat,
        {
          color: employee.status === 'clocked-in' ? '#10b981' : 
                 employee.status === 'break' ? '#f59e0b' : 
                 employee.status === 'out-of-bounds' ? '#ef4444' : '#6b7280',
          popup: `
            <div class="p-2 min-w-[200px]">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold">${employee.name}</h3>
                <span class="px-2 py-1 text-xs rounded border ${getStatusColorClass(employee.status)}">
                  ${employee.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <div class="space-y-1 text-xs">
                <div>📍 ${employee.location.lat.toFixed(4)}, ${employee.location.lng.toFixed(4)}</div>
                <div>👥 ${employee.role}</div>
                ${employee.phoneUsage ? `
                  <div>📱 ${employee.phoneUsage.isUsingPhone ? 'Using Phone' : 'Not Using Phone'}</div>
                  <div>Non-work: ${employee.phoneUsage.nonWorkUsage}m | App: ${employee.phoneUsage.appUsage}m</div>
                ` : ''}
                <div>🕒 Updated ${employee.lastUpdate.toLocaleTimeString()}</div>
              </div>
            </div>
          `
        }
      );
      if (marker) markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [vehicles, employees, isVisible]);

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'active':
      case 'clocked-in':
        return 'text-green-600 border-green-600';
      case 'idle':
      case 'break':
        return 'text-yellow-600 border-yellow-600';
      case 'maintenance':
      case 'out-of-bounds':
        return 'text-red-600 border-red-600';
      case 'offline':
      case 'clocked-out':
        return 'text-gray-600 border-gray-600';
      default:
        return 'text-gray-600 border-gray-600';
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

  if (!isVisible) return null;

  // Fleet tracking overlay UI - markers are handled in useEffect
  return (
    <Card className="absolute top-4 right-4 w-80 z-[600] bg-slate-900/95 border-cyan-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <Truck className="w-4 h-4" />
          {getTerminology('Fleet Command', 'Fleet Tracking')}
          {isConnectedToAPI && (
            <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
              LIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="assets" className="text-xs">Assets</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-3">
            <div className="space-y-2">
              <div className="text-xs text-cyan-400 font-semibold">
                {getTerminology('Vehicle Assets', 'Vehicles')} ({vehicles.length})
              </div>
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-slate-800 p-2 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300">{vehicle.name}</span>
                    <Badge variant="outline" className={getStatusColor(vehicle.status)}>
                      {vehicle.status}
                    </Badge>
                  </div>
                  <div className="text-slate-400">
                    Speed: {vehicle.location.speed.toFixed(1)} mph
                  </div>
                  {vehicle.fuel && (
                    <div className="flex items-center gap-2 mt-1">
                      <Fuel className="w-3 h-3 text-slate-400" />
                      <Progress value={vehicle.fuel} className="flex-1 h-1" />
                      <span className="text-slate-400">{vehicle.fuel}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-xs text-cyan-400 font-semibold">
                {getTerminology('Personnel', 'Employees')} ({employees.length})
              </div>
              {employees.map(employee => (
                <div key={employee.id} className="bg-slate-800 p-2 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300">{employee.name}</span>
                    <Badge variant="outline" className={getStatusColor(employee.status)}>
                      {employee.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="text-slate-400">{employee.role}</div>
                  {employee.phoneUsage && (
                    <div className="text-slate-400 mt-1">
                      📱 {employee.phoneUsage.isUsingPhone ? 'Using phone' : 'Available'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-3">
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className="bg-slate-800 p-2 rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-slate-400">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-300 mb-1">{alert.message}</div>
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-xs h-6"
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs py-4">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                No active alerts
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400">Playback Mode</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isPlaying ? stopPlayback : startPlayback}
                    className="p-1"
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetPlayback}
                    className="p-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {isConnectedToAPI ? (
                <div className="text-xs text-slate-300">
                  Real-time GPS data available
                </div>
              ) : (
                <div className="text-xs text-yellow-400">
                  Using simulated data
                </div>
              )}
              
              <div className="text-xs text-slate-400">
                Data points: {realTimeData.length}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FleetTracking;