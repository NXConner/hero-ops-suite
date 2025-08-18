// @ts-nocheck
// API Service Layer for Blacktop Blackout OverWatch System
import axios from "axios";

// API Configuration
const getEnv = (key: string): string | undefined => {
  try {
    // @ts-ignore
    return typeof import.meta !== "undefined" ? (import.meta as any).env?.[key] : undefined;
  } catch {
    return undefined;
  }
};
const API_CONFIG = {
  WEATHER_API_KEY:
    getEnv("VITE_WEATHER_API_KEY") ||
    getEnv("REACT_APP_WEATHER_API_KEY") ||
    "YOUR_OPENWEATHER_API_KEY",
  WEATHER_BASE_URL: "https://api.openweathermap.org/data/2.5",
  GPS_TRACKING_URL:
    getEnv("VITE_GPS_API_URL") ||
    getEnv("REACT_APP_GPS_API_URL") ||
    "https://api.fleet-tracker.com/v1",
  SENSOR_DATA_URL:
    getEnv("VITE_SENSOR_API_URL") ||
    getEnv("REACT_APP_SENSOR_API_URL") ||
    "https://api.iot-sensors.com/v1",
  RADAR_API_URL: "https://api.rainviewer.com/public/weather-maps.json",
  GEOLOCATION_API_URL: "https://api.bigdatacloud.net/data/reverse-geocode-client",
  // Real IoT sensor endpoints
  TEMPERATURE_SENSOR_URL:
    getEnv("VITE_TEMP_SENSOR_URL") ||
    getEnv("REACT_APP_TEMP_SENSOR_URL") ||
    "http://localhost:8080/api/sensors/temperature",
  PRESSURE_SENSOR_URL:
    getEnv("VITE_PRESSURE_SENSOR_URL") ||
    getEnv("REACT_APP_PRESSURE_SENSOR_URL") ||
    "http://localhost:8080/api/sensors/pressure",
  VIBRATION_SENSOR_URL:
    getEnv("VITE_VIBRATION_SENSOR_URL") ||
    getEnv("REACT_APP_VIBRATION_SENSOR_URL") ||
    "http://localhost:8080/api/sensors/vibration",
  // Real fleet tracking
  FLEET_WEBSOCKET_URL:
    getEnv("VITE_FLEET_WS_URL") ||
    getEnv("REACT_APP_FLEET_WS_URL") ||
    "ws://localhost:8080/ws/fleet",
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
    "1h": number;
  };
  snow?: {
    "1h": number;
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
  status: "active" | "idle" | "offline";
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
  type: "temperature" | "pressure" | "vibration" | "thickness" | "compaction";
  value: number;
  unit: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  quality: "good" | "fair" | "poor";
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

    if (API_CONFIG.WEATHER_API_KEY === "YOUR_OPENWEATHER_API_KEY") {
      throw new Error("Missing OpenWeather API key");
    }

    const response = await axios.get<WeatherAPIResponse>(`${API_CONFIG.WEATHER_BASE_URL}/weather`, {
      params: { lat, lon, appid: API_CONFIG.WEATHER_API_KEY, units: "imperial" },
      timeout: 10000,
    });

    this.cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    return response.data;
  }

  async getWeatherForecast(lat: number, lon: number, hours: number = 12): Promise<any> {
    if (API_CONFIG.WEATHER_API_KEY === "YOUR_OPENWEATHER_API_KEY") {
      throw new Error("Missing OpenWeather API key");
    }

    const response = await axios.get(`${API_CONFIG.WEATHER_BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_CONFIG.WEATHER_API_KEY,
        units: "imperial",
        cnt: Math.min(hours, 40),
      },
      timeout: 10000,
    });

    return response.data;
  }

  async getRadarData(): Promise<RadarAPIResponse> {
    const response = await axios.get<RadarAPIResponse>(API_CONFIG.RADAR_API_URL, {
      timeout: 10000,
    });
    return response.data;
  }

  // Enhanced UV Index API using OpenWeather UVI endpoint, with fallback approximation
  async getUVIndex(lat: number, lon: number): Promise<number> {
    try {
      if (API_CONFIG.WEATHER_API_KEY === "YOUR_OPENWEATHER_API_KEY") {
        throw new Error("Missing OpenWeather API key");
      }
      const { data } = await axios.get(`${API_CONFIG.WEATHER_BASE_URL}/uvi`, {
        params: { appid: API_CONFIG.WEATHER_API_KEY, lat, lon },
        timeout: 8000,
      });
      const v = (data && (data.value ?? data.uvi ?? data.uv)) as number | undefined;
      if (typeof v === "number" && !Number.isNaN(v)) return Math.max(0, Math.min(11, v));
    } catch (_e) {
      // fallback to moderate UV when service unavailable
    }
    return 6;
  }
}

export class GPSTrackingService {
  private static instance: GPSTrackingService;
  private listeners: Set<(data: GPSTrackingResponse[]) => void> = new Set();
  private ws: WebSocket | null = null;
  private pollTimer: any = null;

  static getInstance(): GPSTrackingService {
    if (!GPSTrackingService.instance) {
      GPSTrackingService.instance = new GPSTrackingService();
    }
    return GPSTrackingService.instance;
  }

  // Attempt to connect to a websocket if configured; fall back silently
  connectWebSocket(url: string = API_CONFIG.FLEET_WEBSOCKET_URL): WebSocket {
    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => {
        // Optionally authenticate or subscribe to channels here
      };
      this.ws.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data as any);
          const updates: GPSTrackingResponse[] = Array.isArray(parsed)
            ? parsed
            : parsed?.devices || parsed?.data || [];
          if (updates && updates.length) this.emit(updates);
        } catch {
          // ignore malformed frames
        }
      };
      this.ws.onerror = () => {
        // Fallback to mock interval if websocket fails
        this.startMockRealtime();
      };
      this.ws.onclose = () => {
        // If there are listeners, ensure we still provide updates
        if (this.listeners.size > 0) this.startMockRealtime();
      };
      return this.ws;
    } catch {
      // Browser may block or URL invalid
      this.startMockRealtime();
      return new WebSocket("wss://invalid.localhost/ignored");
    }
  }

  // Fetch one-time device locations. Try real API; fallback to mock
  async getDeviceLocations(): Promise<GPSTrackingResponse[]> {
    try {
      const url = `${API_CONFIG.GPS_TRACKING_URL}/devices`;
      const { data } = await axios.get(url, { timeout: 6000 });
      const devices: GPSTrackingResponse[] = Array.isArray(data) ? data : data?.devices || [];
      if (devices && devices.length) return devices;
      throw new Error("Empty devices list");
    } catch {
      return this.generateMockDevices();
    }
  }

  subscribeToRealTimeUpdates(cb: (data: GPSTrackingResponse[]) => void): void {
    this.listeners.add(cb);
    if (!this.ws && !this.pollTimer) {
      // Prefer websocket if available, else mock interval
      try {
        this.connectWebSocket();
      } catch {
        this.startMockRealtime();
      }
    }
  }

  unsubscribeFromRealTimeUpdates(cb: (data: GPSTrackingResponse[]) => void): void {
    this.listeners.delete(cb);
    if (this.listeners.size === 0) {
      this.stopRealtime();
    }
  }

  private emit(data: GPSTrackingResponse[]) {
    this.listeners.forEach((fn) => {
      try {
        fn(data);
      } catch {
        /* ignore listener errors */
      }
    });
  }

  private startMockRealtime() {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => {
      const updates = this.generateMockDevices(true);
      this.emit(updates);
    }, 3000);
  }

  private stopRealtime() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        /* ignore */
      }
      this.ws = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  // Mock data generator around a base location (NYC)
  private generateMockDevices(jitter: boolean = false): GPSTrackingResponse[] {
    const baseLat = 40.7128;
    const baseLon = -74.006;
    const makeDevice = (
      idx: number,
      opts: Partial<GPSTrackingResponse> = {},
    ): GPSTrackingResponse => {
      const offset = jitter ? (Math.random() - 0.5) * 0.02 : (idx - 3) * 0.01;
      const lat = baseLat + offset;
      const lon = baseLon + offset * 1.2;
      const speed = Math.max(0, 20 + (Math.random() - 0.5) * 15);
      const heading = Math.floor(Math.random() * 360);
      return {
        deviceId: `veh-${idx}`,
        timestamp: new Date().toISOString(),
        location: {
          latitude: lat,
          longitude: lon,
          altitude: 10 + Math.random() * 5,
          accuracy: 5 + Math.random() * 10,
          speed,
          heading,
        },
        status: speed > 2 ? "active" : "idle",
        batteryLevel: 60 + Math.random() * 40,
        isMoving: speed > 1,
        driver: { id: `drv-${idx}`, name: `Driver ${idx}` },
        vehicle: { id: `Truck ${idx}`, type: "truck", license: `OPS-${100 + idx}` },
        ...opts,
      } as GPSTrackingResponse;
    };

    const list: GPSTrackingResponse[] = [
      makeDevice(1),
      makeDevice(2),
      makeDevice(3, { status: "idle" }),
      makeDevice(4),
      makeDevice(5, { status: "active" }),
    ];

    // Add a couple of employee handhelds without vehicle assigned
    list.push({
      deviceId: "emp-1",
      timestamp: new Date().toISOString(),
      location: {
        latitude: baseLat + 0.015,
        longitude: baseLon - 0.008,
        altitude: 0,
        accuracy: 12,
        speed: 1,
        heading: 90,
      },
      status: "active",
      isMoving: true,
      driver: { id: "emp-1", name: "Employee A" },
    } as GPSTrackingResponse);

    list.push({
      deviceId: "emp-2",
      timestamp: new Date().toISOString(),
      location: {
        latitude: baseLat - 0.01,
        longitude: baseLon + 0.006,
        altitude: 0,
        accuracy: 15,
        speed: 0,
        heading: 45,
      },
      status: "idle",
      isMoving: false,
      driver: { id: "emp-2", name: "Employee B" },
    } as GPSTrackingResponse);

    return list;
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
          params: sensorIds && sensorIds.length ? { sensors: sensorIds.join(",") } : undefined,
          timeout: 8000,
        },
      );
      return response.data;
    } catch (error) {
      // Fallback mock data
      return [
        {
          sensorId: "temp_01",
          type: "temperature",
          value: 195,
          unit: "°F",
          timestamp: new Date().toISOString(),
          location: { latitude: 40.7128, longitude: -74.006 },
          quality: "good",
        },
        {
          sensorId: "press_01",
          type: "pressure",
          value: 1750,
          unit: "PSI",
          timestamp: new Date().toISOString(),
          location: { latitude: 40.7128, longitude: -74.006 },
          quality: "good",
        },
      ];
    }
  }
}

// Pavement Scan API client
const API_BASE =
  getEnv("VITE_API_BASE_URL") || getEnv("REACT_APP_API_BASE_URL") || "http://localhost:3001";

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
    const { data } = await axios.post(
      `${API_BASE}/scans/${encodeURIComponent(scanId)}/overlay`,
      overlay,
    );
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
