// @ts-nocheck
// API Service Layer for Blacktop Blackout OverWatch System
import axios from 'axios';

// API Configuration
const getEnv = (key: string): string | undefined => {
  try {
    // @ts-ignore
    return typeof import.meta !== 'undefined' ? (import.meta as any).env?.[key] : undefined;
  } catch {
    return undefined;
  }
};
const API_CONFIG = {
  WEATHER_API_KEY: getEnv('VITE_WEATHER_API_KEY') || getEnv('REACT_APP_WEATHER_API_KEY') || 'YOUR_OPENWEATHER_API_KEY',
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  GPS_TRACKING_URL: getEnv('VITE_GPS_API_URL') || getEnv('REACT_APP_GPS_API_URL') || 'https://api.fleet-tracker.com/v1',
  SENSOR_DATA_URL: getEnv('VITE_SENSOR_API_URL') || getEnv('REACT_APP_SENSOR_API_URL') || 'https://api.iot-sensors.com/v1',
  RADAR_API_URL: 'https://api.rainviewer.com/public/weather-maps.json',
  GEOLOCATION_API_URL: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
  // Real IoT sensor endpoints
  TEMPERATURE_SENSOR_URL: getEnv('VITE_TEMP_SENSOR_URL') || getEnv('REACT_APP_TEMP_SENSOR_URL') || 'http://localhost:8080/api/sensors/temperature',
  PRESSURE_SENSOR_URL: getEnv('VITE_PRESSURE_SENSOR_URL') || getEnv('REACT_APP_PRESSURE_SENSOR_URL') || 'http://localhost:8080/api/sensors/pressure',
  VIBRATION_SENSOR_URL: getEnv('VITE_VIBRATION_SENSOR_URL') || getEnv('REACT_APP_VIBRATION_SENSOR_URL') || 'http://localhost:8080/api/sensors/vibration',
  // Real fleet tracking
  FLEET_WEBSOCKET_URL: getEnv('VITE_FLEET_WS_URL') || getEnv('REACT_APP_FLEET_WS_URL') || 'ws://localhost:8080/ws/fleet'
};

// Types for API responses
export interface WeatherAPIResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  visibility: number;
  dt: number;
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h': number;
  };
  snow?: {
    '1h': number;
  };
}

export interface GPSTrackingResponse {
  deviceId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
    speed: number;
    heading: number;
  };
  status: 'active' | 'idle' | 'offline';
  batteryLevel?: number;
  isMoving: boolean;
  driver?: {
    id: string;
    name: string;
  };
  vehicle?: {
    id: string;
    type: string;
    license: string;
  };
}

export interface SensorDataResponse {
  sensorId: string;
  type: 'temperature' | 'pressure' | 'vibration' | 'thickness' | 'compaction';
  value: number;
  unit: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  quality: 'good' | 'fair' | 'poor';
  alerts?: string[];
  calibrationDate?: string;
  batteryLevel?: number;
}

export interface RadarAPIResponse {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: Array<{
      time: number;
      path: string;
    }>;
    nowcast: Array<{
      time: number;
      path: string;
    }>;
  };
  satellite: {
    infrared: Array<{
      time: number;
      path: string;
    }>;
  };
}

// Enhanced Weather API Service
interface WeatherApiResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  visibility: number;
  name: string;
  dt: number;
}

interface CachedWeatherData {
  data: WeatherApiResponse;
  timestamp: number;
}

export class WeatherService {
  private static instance: WeatherService;
  private cache: Map<string, CachedWeatherData> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  private getCacheKey(lat: number, lon: number): string {
    return `${lat.toFixed(3)},${lon.toFixed(3)}`;
  }

  private isDataFresh(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherAPIResponse> {
    const cacheKey = this.getCacheKey(lat, lon);
    const cached = this.cache.get(cacheKey);

    if (cached && this.isDataFresh(cached.timestamp)) {
      return cached.data;
    }

    if (API_CONFIG.WEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
      throw new Error('Missing OpenWeather API key');
    }

    const response = await axios.get<WeatherAPIResponse>(
      `${API_CONFIG.WEATHER_BASE_URL}/weather`,
      {
        params: { lat, lon, appid: API_CONFIG.WEATHER_API_KEY, units: 'imperial' },
        timeout: 10000
      }
    );

    this.cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    return response.data;
  }

  async getWeatherForecast(lat: number, lon: number, hours: number = 12): Promise<any> {
    if (API_CONFIG.WEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
      throw new Error('Missing OpenWeather API key');
    }

    const response = await axios.get(
      `${API_CONFIG.WEATHER_BASE_URL}/forecast`,
      {
        params: { lat, lon, appid: API_CONFIG.WEATHER_API_KEY, units: 'imperial', cnt: Math.min(hours, 40) },
        timeout: 10000
      }
    );

    return response.data;
  }

  async getRadarData(): Promise<RadarAPIResponse> {
    const response = await axios.get<RadarAPIResponse>(API_CONFIG.RADAR_API_URL, { timeout: 10000 });
    return response.data;
  }

  // Enhanced UV Index API (requires separate service)
  async getUVIndex(lat: number, lon: number): Promise<number> {
    // Placeholder
    return 5;
  }
}

export class GPSTrackingService {
  private static instance: GPSTrackingService;

  static getInstance(): GPSTrackingService {
    if (!GPSTrackingService.instance) {
      GPSTrackingService.instance = new GPSTrackingService();
    }
    return GPSTrackingService.instance;
  }

  // Placeholder for real GPS tracking integration
  connectWebSocket(url: string = API_CONFIG.FLEET_WEBSOCKET_URL): WebSocket {
    return new WebSocket(url);
  }
}

// Sensor Data Service (unchanged)
export class SensorDataService {
  private static instance: SensorDataService;

  static getInstance(): SensorDataService {
    if (!SensorDataService.instance) {
      SensorDataService.instance = new SensorDataService();
    }
    return SensorDataService.instance;
  }

  async getSensorData(sensorIds?: string[]): Promise<SensorDataResponse[]> {
    try {
      const response = await axios.get<SensorDataResponse[]>(
        `${API_CONFIG.SENSOR_DATA_URL}/current`,
        {
          params: sensorIds && sensorIds.length ? { sensors: sensorIds.join(',') } : undefined,
          timeout: 8000
        }
      );
      return response.data;
    } catch (error) {
      // Fallback mock data
      return [
        {
          sensorId: 'temp_01', type: 'temperature', value: 195, unit: '°F', timestamp: new Date().toISOString(),
          location: { latitude: 40.7128, longitude: -74.0060 }, quality: 'good'
        },
        {
          sensorId: 'press_01', type: 'pressure', value: 1750, unit: 'PSI', timestamp: new Date().toISOString(),
          location: { latitude: 40.7128, longitude: -74.0060 }, quality: 'good'
        },
      ];
    }
  }
}

// Pavement Scan API client
const API_BASE = getEnv('VITE_API_BASE_URL') || getEnv('REACT_APP_API_BASE_URL') || 'http://localhost:3001';

export class PavementScanService {
  private static instance: PavementScanService;

  static getInstance(): PavementScanService {
    if (!PavementScanService.instance) {
      PavementScanService.instance = new PavementScanService();
    }
    return PavementScanService.instance;
  }

  async listScans() {
    const { data } = await axios.get(`${API_BASE}/scans`);
    return data?.scans || [];
  }

  async createScan(payload: any = {}) {
    const { data } = await axios.post(`${API_BASE}/scans`, payload);
    return data; // { scan_id }
  }

  async updateScan(scanId: string, payload: any) {
    const { data } = await axios.put(`${API_BASE}/scans/${encodeURIComponent(scanId)}`, payload);
    return data?.scan;
  }

  async uploadOverlay(scanId: string, overlay: any) {
    const { data } = await axios.post(`${API_BASE}/scans/${encodeURIComponent(scanId)}/overlay`, overlay);
    return data?.ok === true;
  }

  async getOverlay(scanId: string) {
    const { data } = await axios.get(`${API_BASE}/scans/${encodeURIComponent(scanId)}/overlay`);
    return data;
  }

  async getScan(scanId: string) {
    const { data } = await axios.get(`${API_BASE}/scans/${encodeURIComponent(scanId)}`);
    return data; // { scan, overlay }
  }

  async estimate(scanId: string) {
    const { data } = await axios.post(`${API_BASE}/estimate/${encodeURIComponent(scanId)}`);
    return data; // { lines, mobilization, contingencyPercent, subtotal, total }
  }

  async analyticsSummary() {
    const { data } = await axios.get(`${API_BASE}/analytics/summary`);
    return data;
  }

  async analyticsPrioritized() {
    const { data } = await axios.get(`${API_BASE}/analytics/prioritized`);
    return data?.rows || [];
  }
}

// Export service instances
export const weatherService = WeatherService.getInstance();
export const gpsTrackingService = GPSTrackingService.getInstance();
export const sensorDataService = SensorDataService.getInstance();
export const pavementScanService = PavementScanService.getInstance();