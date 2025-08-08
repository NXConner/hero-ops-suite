import { z } from 'zod';

export const WeatherSchema = z.object({
  main: z.object({
    temp: z.number(),
    humidity: z.number(),
    pressure: z.number(),
    feels_like: z.number().optional(),
  }),
  weather: z.array(z.object({
    main: z.string(),
    description: z.string(),
    icon: z.string(),
  })),
  wind: z.object({
    speed: z.number(),
    deg: z.number(),
    gust: z.number().optional(),
  }),
  visibility: z.number(),
  dt: z.number(),
  name: z.string(),
  coord: z.object({ lat: z.number(), lon: z.number() }),
  clouds: z.object({ all: z.number() }),
  rain: z.object({ '1h': z.number() }).optional(),
  snow: z.object({ '1h': z.number() }).optional(),
});

export type Weather = z.infer<typeof WeatherSchema>;

export const GPSTrackingSchema = z.object({
  deviceId: z.string(),
  timestamp: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number().optional(),
    accuracy: z.number(),
    speed: z.number(),
    heading: z.number(),
  }),
  status: z.enum(['active', 'idle', 'offline']),
  batteryLevel: z.number().optional(),
  isMoving: z.boolean(),
  driver: z.object({ id: z.string(), name: z.string() }).optional(),
  vehicle: z.object({ id: z.string(), type: z.string(), license: z.string().optional() }).optional(),
});

export type GPSTracking = z.infer<typeof GPSTrackingSchema>;

export const SensorDataSchema = z.object({
  sensorId: z.string(),
  type: z.enum(['temperature','pressure','vibration','thickness','compaction']),
  value: z.number(),
  unit: z.string(),
  timestamp: z.string(),
  location: z.object({ latitude: z.number(), longitude: z.number() }),
  quality: z.enum(['good','fair','poor']),
  alerts: z.array(z.string()).optional(),
  calibrationDate: z.string().optional(),
  batteryLevel: z.number().optional(),
});

export type SensorData = z.infer<typeof SensorDataSchema>;

export const RadarSchema = z.object({
  version: z.string(),
  generated: z.number(),
  host: z.string(),
  radar: z.object({
    past: z.array(z.object({ time: z.number(), path: z.string() })),
    nowcast: z.array(z.object({ time: z.number(), path: z.string() })),
  }),
  satellite: z.object({ infrared: z.array(z.object({ time: z.number(), path: z.string() })) }),
});

export type RadarData = z.infer<typeof RadarSchema>;