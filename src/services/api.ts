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
    if (API_CONFIG.WEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
      throw new Error('Missing OpenWeather API key');
    }

    const response = await axios.get(
      `${API_CONFIG.WEATHER_BASE_URL}/uvi`,
      { params: { lat, lon, appid: API_CONFIG.WEATHER_API_KEY }, timeout: 5000 }
    );

    return response.data.value || 6;
  }

  // Air Quality API
  async getAirQuality(lat: number, lon: number): Promise<any> {
    if (API_CONFIG.WEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
      throw new Error('Missing OpenWeather API key');
    }

    const response = await axios.get(
      `${API_CONFIG.WEATHER_BASE_URL}/air_pollution`,
      { params: { lat, lon, appid: API_CONFIG.WEATHER_API_KEY }, timeout: 5000 }
    );

    return response.data.list[0];
  }
}

// GPS Tracking Service (unchanged)
export class GPSTrackingService {
  private static instance: GPSTrackingService;
  private websocket: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: GPSTrackingResponse[]) => void> = [];

  static getInstance(): GPSTrackingService {
    if (!GPSTrackingService.instance) {
      GPSTrackingService.instance = new GPSTrackingService();
    }
    return GPSTrackingService.instance;
  }

  async getDeviceLocations(deviceIds?: string[]): Promise<GPSTrackingResponse[]> {
    try {
      const response = await axios.get<GPSTrackingResponse[]>(
        `${API_CONFIG.GPS_TRACKING_URL}/locations`,
        { params: deviceIds ? { devices: deviceIds.join(',') } : {}, timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      console.error('GPS Tracking API Error:', error);
      return [];
    }
  }

  async getDeviceHistory(deviceId: string, startTime: Date, endTime: Date): Promise<GPSTrackingResponse[]> {
    try {
      const response = await axios.get<GPSTrackingResponse[]>(
        `${API_CONFIG.GPS_TRACKING_URL}/history/${deviceId}`,
        { params: { start: startTime.toISOString(), end: endTime.toISOString() }, timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      console.error('GPS History API Error:', error);
      return [];
    }
  }

  subscribeToRealTimeUpdates(callback: (data: GPSTrackingResponse[]) => void): void {
    this.subscribers.push(callback);
    if (!this.websocket) {
      this.connectWebSocket();
    }
  }

  unsubscribeFromRealTimeUpdates(callback: (data: GPSTrackingResponse[]) => void): void {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
    if (this.subscribers.length === 0 && this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  private connectWebSocket(): void {
    try {
      const wsUrl = API_CONFIG.GPS_TRACKING_URL.replace('https://', 'wss://').replace('http://', 'ws://');
      this.websocket = new WebSocket(`${wsUrl}/realtime`);

      this.websocket.onopen = () => {
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.websocket.onmessage = (event) => {
        try {
          const data: GPSTrackingResponse[] = JSON.parse(event.data);
          this.subscribers.forEach(callback => callback(data));
        } catch (error) {
          console.error('GPS WebSocket message parsing error:', error);
        }
      };

      this.websocket.onclose = () => {
        this.websocket = null;
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('GPS WebSocket error:', error);
      };
    } catch (error) {
      console.error('GPS WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.reconnectInterval && this.subscribers.length > 0) {
      this.reconnectInterval = setInterval(() => {
        this.connectWebSocket();
      }, 5000);
    }
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
        { params: sensorIds ? { sensors: sensorIds.join(',') } : {}, timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      console.error('Sensor Data API Error:', error);
      return [];
    }
  }

  async getSensorHistory(sensorId: string, startTime: Date, endTime: Date): Promise<SensorDataResponse[]> {
    try {
      const response = await axios.get<SensorDataResponse[]>(
        `${API_CONFIG.SENSOR_DATA_URL}/history/${sensorId}`,
        { params: { start: startTime.toISOString(), end: endTime.toISOString() }, timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      console.error('Sensor History API Error:', error);
      return [];
    }
  }
}

// Geolocation Service (unchanged)
export class GeolocationService {
  static async reverseGeocode(lat: number, lon: number): Promise<any> {
    try {
      const response = await axios.get(API_CONFIG.GEOLOCATION_API_URL, {
        params: { latitude: lat, longitude: lon },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Geolocation API Error:', error);
      return null;
    }
  }
}

// Export service instances
export const weatherService = WeatherService.getInstance();
export const gpsTrackingService = GPSTrackingService.getInstance();
export const sensorDataService = SensorDataService.getInstance();