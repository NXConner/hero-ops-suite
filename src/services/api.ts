// API Service Layer for Blacktop Blackout OverWatch System
import axios from 'axios';

// API Configuration
const API_CONFIG = {
  WEATHER_API_KEY: process.env.REACT_APP_WEATHER_API_KEY || 'demo_key',
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  GPS_TRACKING_URL: process.env.REACT_APP_GPS_API_URL || 'https://api.example.com/gps',
  SENSOR_DATA_URL: process.env.REACT_APP_SENSOR_API_URL || 'https://api.example.com/sensors',
  RADAR_API_URL: 'https://api.rainviewer.com/public/weather-maps.json',
  GEOLOCATION_API_URL: 'https://api.bigdatacloud.net/data/reverse-geocode-client'
};

// Types for API responses
export interface WeatherAPIResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  dt: number;
  name: string;
  coord: {
    lat: number;
    lon: number;
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

// Weather API Service
export class WeatherService {
  private static instance: WeatherService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
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

    try {
      const response = await axios.get<WeatherAPIResponse>(
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

      this.cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      return response.data;
    } catch (error) {
      console.error('Weather API Error:', error);
      // Return mock data as fallback
      return this.getMockWeatherData(lat, lon);
    }
  }

  async getWeatherForecast(lat: number, lon: number, hours: number = 12): Promise<any> {
    try {
      const response = await axios.get(
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
      const response = await axios.get<RadarAPIResponse>(
        API_CONFIG.RADAR_API_URL,
        { timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      console.error('Radar API Error:', error);
      return this.getMockRadarData();
    }
  }

  private getMockWeatherData(lat: number, lon: number): WeatherAPIResponse {
    return {
      main: {
        temp: 72 + Math.random() * 10,
        humidity: 60 + Math.random() * 20,
        pressure: 1013 + Math.random() * 20
      },
      weather: [{
        main: 'Clouds',
        description: 'partly cloudy',
        icon: '02d'
      }],
      wind: {
        speed: 5 + Math.random() * 10,
        deg: Math.random() * 360
      },
      visibility: 10000,
      dt: Date.now() / 1000,
      name: 'Mock Location',
      coord: { lat, lon }
    };
  }

  private getMockForecastData(): any {
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
      const response = await axios.get<GPSTrackingResponse[]>(
        `${API_CONFIG.GPS_TRACKING_URL}/locations`,
        {
          params: deviceIds ? { devices: deviceIds.join(',') } : {},
          timeout: 10000
        }
      );
      return response.data;
    } catch (error) {
      console.error('GPS Tracking API Error:', error);
      return this.getMockGPSData();
    }
  }

  async getDeviceHistory(deviceId: string, startTime: Date, endTime: Date): Promise<GPSTrackingResponse[]> {
    try {
      const response = await axios.get<GPSTrackingResponse[]>(
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
      const response = await axios.get<SensorDataResponse[]>(
        `${API_CONFIG.SENSOR_DATA_URL}/current`,
        {
          params: sensorIds ? { sensors: sensorIds.join(',') } : {},
          timeout: 10000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Sensor Data API Error:', error);
      return this.getMockSensorData();
    }
  }

  async getSensorHistory(sensorId: string, startTime: Date, endTime: Date): Promise<SensorDataResponse[]> {
    try {
      const response = await axios.get<SensorDataResponse[]>(
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
      const response = await axios.get(API_CONFIG.GEOLOCATION_API_URL, {
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