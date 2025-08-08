// @ts-nocheck
// API Service Layer for Blacktop Blackout OverWatch System
import http from './http';
import { WeatherSchema, RadarSchema, GPSTrackingSchema, SensorDataSchema } from './schemas';

// API Configuration
const getEnv = (key: string): string | undefined => {
  try {
    // @ts-ignore
    return typeof import.meta !== 'undefined' ? (import.meta as any).env?.[key] : undefined;
  } catch {
    return undefined;
  }
};
export const API_CONFIG = {
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

    // Check if we have a valid API key
    if (API_CONFIG.WEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
      console.warn('Please set REACT_APP_WEATHER_API_KEY environment variable');
      return this.getMockWeatherData(lat, lon);
    }

    try {
      const response = await http.get(
        `${API_CONFIG.WEATHER_BASE_URL}/weather`,
        {
          params: {
            lat,
            lon,
            appid: API_CONFIG.WEATHER_API_KEY,
            units: 'imperial'
          },
          timeout: 10000
        }
      );

      const parsed = WeatherSchema.safeParse(response.data);
      const data = parsed.success ? parsed.data : response.data;

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Weather API Error:', error);
      if ((error as any).isAxiosError && (error as any).response?.status === 401) {
        console.error('Invalid API key. Please check your OpenWeather API key.');
      }
      return this.getMockWeatherData(lat, lon);
    }
  }

  async getWeatherForecast(lat: number, lon: number, hours: number = 12): Promise<any> {
    if (API_CONFIG.WEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
      return this.getMockForecastData();
    }

    try {
      const response = await http.get(
        `${API_CONFIG.WEATHER_BASE_URL}/forecast`,
        {
          params: {
            lat,
            lon,
            appid: API_CONFIG.WEATHER_API_KEY,
            units: 'imperial',
            cnt: Math.min(hours, 40) // API limit
          },
          timeout: 10000
        }
      );

      return response.data;
    } catch (error) {
      console.error('Weather Forecast API Error:', error);
      return this.getMockForecastData();
    }
  }

  async getRadarData(): Promise<RadarAPIResponse> {
    try {
      const response = await http.get(
        API_CONFIG.RADAR_API_URL,
        { timeout: 10000 }
      );
      const parsed = RadarSchema.safeParse(response.data);
      return parsed.success ? parsed.data : response.data;
    } catch (error) {
      console.error('Radar API Error:', error);
      return this.getMockRadarData();
    }
  }

  // Enhanced UV Index API (requires separate service)
  async getUVIndex(lat: number, lon: number): Promise<number> {
    try {
      if (API_CONFIG.WEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        return 6; // Mock UV index
      }

      const response = await http.get(
        `${API_CONFIG.WEATHER_BASE_URL}/uvi`,
        {
          params: {
            lat,
            lon,
            appid: API_CONFIG.WEATHER_API_KEY
          },
          timeout: 5000
        }
      );

      return response.data.value || 6;
    } catch (error) {
      console.error('UV Index API Error:', error);
      return 6; // Default safe value
    }
  }

  // Air Quality API
  async getAirQuality(lat: number, lon: number): Promise<any> {
    try {
      if (API_CONFIG.WEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        return {
          aqi: 3,
          components: {
            co: 233.4,
            no: 0.01,
            no2: 13.64,
            o3: 54.31,
            so2: 0.75,
            pm2_5: 8.04,
            pm10: 9.78
          }
        };
      }

      const response = await http.get(
        `${API_CONFIG.WEATHER_BASE_URL}/air_pollution`,
        {
          params: {
            lat,
            lon,
            appid: API_CONFIG.WEATHER_API_KEY
          },
          timeout: 5000
        }
      );

      return response.data.list[0];
    } catch (error) {
      console.error('Air Quality API Error:', error);
      return null;
    }
  }

  private getMockWeatherData(lat: number, lon: number): WeatherAPIResponse {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Snow'];
    const selectedCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      main: {
        temp: 65 + Math.random() * 20,
        humidity: 50 + Math.random() * 30,
        pressure: 1013 + Math.random() * 20,
        feels_like: 65 + Math.random() * 20
      },
      weather: [{
        main: selectedCondition,
        description: selectedCondition.toLowerCase(),
        icon: selectedCondition === 'Clear' ? '01d' : 
              selectedCondition === 'Clouds' ? '02d' :
              selectedCondition === 'Rain' ? '10d' : '50d'
      }],
      wind: {
        speed: Math.random() * 15,
        deg: Math.random() * 360,
        gust: Math.random() * 20
      },
      visibility: 8000 + Math.random() * 2000,
      dt: Date.now() / 1000,
      name: 'Mock Location',
      coord: { lat, lon },
      clouds: {
        all: Math.floor(Math.random() * 100)
      },
      rain: selectedCondition === 'Rain' ? { '1h': Math.random() * 5 } : undefined
    };
  }

  private getMockForecastData(): { list: Array<Partial<WeatherApiResponse & { pop: number }>> } {
    const forecast = [];
    for (let i = 0; i < 12; i++) {
      forecast.push({
        dt: Date.now() / 1000 + (i * 3600),
        main: {
          temp: 70 + Math.random() * 15,
          humidity: 60 + Math.random() * 30
        },
        weather: [{
          main: Math.random() > 0.7 ? 'Rain' : 'Clouds',
          description: 'mock weather'
        }],
        pop: Math.random() * 0.5
      });
    }
    return { list: forecast };
  }

  private getMockRadarData(): RadarAPIResponse {
    const now = Date.now();
    const frames = [];
    for (let i = -7; i <= 0; i++) {
      frames.push({
        time: Math.floor((now + i * 15 * 60 * 1000) / 1000),
        path: `/mock/radar/frame_${i + 7}.png`
      });
    }
    
    return {
      version: '1.0',
      generated: Math.floor(now / 1000),
      host: 'mock.api',
      radar: {
        past: frames,
        nowcast: []
      },
      satellite: {
        infrared: []
      }
    };
  }
}

// GPS Tracking Service
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
      const response = await http.get<GPSTrackingResponse[]>(
        `${API_CONFIG.GPS_TRACKING_URL}/locations`,
        {
          params: deviceIds ? { devices: deviceIds.join(',') } : {},
          timeout: 10000
        }
      );
      const parsed = Array.isArray(response.data) ? response.data.filter((d: any) => GPSTrackingSchema.safeParse(d).success) : response.data;
      return parsed;
    } catch (error) {
      console.error('GPS Tracking API Error:', error);
      return this.getMockGPSData();
    }
  }

  async getDeviceHistory(deviceId: string, startTime: Date, endTime: Date): Promise<GPSTrackingResponse[]> {
    try {
      const response = await http.get<GPSTrackingResponse[]>(
        `${API_CONFIG.GPS_TRACKING_URL}/history/${deviceId}`,
        {
          params: {
            start: startTime.toISOString(),
            end: endTime.toISOString()
          },
          timeout: 15000
        }
      );
      return response.data;
    } catch (error) {
      console.error('GPS History API Error:', error);
      return this.getMockHistoryData(deviceId, startTime, endTime);
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
        console.log('GPS WebSocket connected');
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
        console.log('GPS WebSocket disconnected');
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

  private getMockGPSData(): GPSTrackingResponse[] {
    const devices = ['vehicle_001', 'vehicle_002', 'employee_001', 'employee_002'];
    return devices.map(deviceId => ({
      deviceId,
      timestamp: new Date().toISOString(),
      location: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
        altitude: 10 + Math.random() * 50,
        accuracy: 3 + Math.random() * 5,
        speed: Math.random() * 30,
        heading: Math.random() * 360
      },
      status: ['active', 'idle', 'offline'][Math.floor(Math.random() * 3)] as any,
      batteryLevel: 20 + Math.random() * 80,
      isMoving: Math.random() > 0.5
    }));
  }

  private getMockHistoryData(deviceId: string, startTime: Date, endTime: Date): GPSTrackingResponse[] {
    const history: GPSTrackingResponse[] = [];
    const duration = endTime.getTime() - startTime.getTime();
    const intervals = Math.min(Math.floor(duration / (5 * 60 * 1000)), 100); // Every 5 minutes, max 100 points
    
    let lat = 40.7128;
    let lon = -74.0060;
    
    for (let i = 0; i <= intervals; i++) {
      lat += (Math.random() - 0.5) * 0.001;
      lon += (Math.random() - 0.5) * 0.001;
      
      history.push({
        deviceId,
        timestamp: new Date(startTime.getTime() + (i * duration / intervals)).toISOString(),
        location: {
          latitude: lat,
          longitude: lon,
          altitude: 10 + Math.random() * 50,
          accuracy: 3 + Math.random() * 5,
          speed: Math.random() * 35,
          heading: Math.random() * 360
        },
        status: 'active',
        isMoving: Math.random() > 0.3
      });
    }
    
    return history;
  }
}

// Sensor Data Service
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
      const response = await http.get<SensorDataResponse[]>(
        `${API_CONFIG.SENSOR_DATA_URL}/current`,
        {
          params: sensorIds ? { sensors: sensorIds.join(',') } : {},
          timeout: 10000
        }
      );
      const parsed = Array.isArray(response.data) ? response.data.filter((d: any) => SensorDataSchema.safeParse(d).success) : response.data;
      return parsed;
    } catch (error) {
      console.error('Sensor Data API Error:', error);
      return this.getMockSensorData();
    }
  }

  async getSensorHistory(sensorId: string, startTime: Date, endTime: Date): Promise<SensorDataResponse[]> {
    try {
      const response = await http.get<SensorDataResponse[]>(
        `${API_CONFIG.SENSOR_DATA_URL}/history/${sensorId}`,
        {
          params: {
            start: startTime.toISOString(),
            end: endTime.toISOString()
          },
          timeout: 15000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Sensor History API Error:', error);
      return this.getMockSensorHistory(sensorId, startTime, endTime);
    }
  }

  private getMockSensorData(): SensorDataResponse[] {
    const sensorTypes: SensorDataResponse['type'][] = ['temperature', 'pressure', 'vibration', 'thickness', 'compaction'];
    const sensors: SensorDataResponse[] = [];
    
    sensorTypes.forEach((type, index) => {
      sensors.push({
        sensorId: `sensor_${type}_${index + 1}`,
        type,
        value: this.getMockValueForType(type),
        unit: this.getUnitForType(type),
        timestamp: new Date().toISOString(),
        location: {
          latitude: 40.7128 + (Math.random() - 0.5) * 0.005,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.005
        },
        quality: ['good', 'fair', 'poor'][Math.floor(Math.random() * 3)] as any,
        alerts: Math.random() > 0.8 ? ['Reading outside normal range'] : []
      });
    });
    
    return sensors;
  }

  private getMockSensorHistory(sensorId: string, startTime: Date, endTime: Date): SensorDataResponse[] {
    const history: SensorDataResponse[] = [];
    const duration = endTime.getTime() - startTime.getTime();
    const intervals = Math.min(Math.floor(duration / (10 * 60 * 1000)), 50); // Every 10 minutes, max 50 points
    
    const type = sensorId.includes('temperature') ? 'temperature' : 
                 sensorId.includes('pressure') ? 'pressure' : 
                 sensorId.includes('vibration') ? 'vibration' : 
                 sensorId.includes('thickness') ? 'thickness' : 'compaction';
    
    for (let i = 0; i <= intervals; i++) {
      history.push({
        sensorId,
        type,
        value: this.getMockValueForType(type),
        unit: this.getUnitForType(type),
        timestamp: new Date(startTime.getTime() + (i * duration / intervals)).toISOString(),
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        quality: 'good',
        alerts: []
      });
    }
    
    return history;
  }

  private getMockValueForType(type: SensorDataResponse['type']): number {
    switch (type) {
      case 'temperature': return 150 + Math.random() * 100; // °F
      case 'pressure': return 2000 + Math.random() * 1000; // PSI
      case 'vibration': return Math.random() * 10; // Hz
      case 'thickness': return 2 + Math.random() * 4; // inches
      case 'compaction': return 92 + Math.random() * 8; // %
      default: return Math.random() * 100;
    }
  }

  private getUnitForType(type: SensorDataResponse['type']): string {
    switch (type) {
      case 'temperature': return '°F';
      case 'pressure': return 'PSI';
      case 'vibration': return 'Hz';
      case 'thickness': return 'in';
      case 'compaction': return '%';
      default: return 'units';
    }
  }
}

// Geolocation Service
export class GeolocationService {
  static async reverseGeocode(lat: number, lon: number): Promise<any> {
    try {
      const response = await http.get(API_CONFIG.GEOLOCATION_API_URL, {
        params: { latitude: lat, longitude: lon },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Geolocation API Error:', error);
      return {
        city: 'Unknown City',
        countryName: 'Unknown Country',
        principalSubdivision: 'Unknown State'
      };
    }
  }
}

// Export service instances
export const weatherService = WeatherService.getInstance();
export const gpsTrackingService = GPSTrackingService.getInstance();
export const sensorDataService = SensorDataService.getInstance();