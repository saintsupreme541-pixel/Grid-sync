import { TelemetryReading } from '../types/microgrid';

export const INITIAL_24H_DATASET: TelemetryReading[] = [
  { timestamp: "2015-06-16 15:00:00", ambient_temp_c: 35.66, humidity_pct: 56.38, solar_irradiance_wm2: 169.0 },
  { timestamp: "2015-06-16 16:00:00", ambient_temp_c: 34.55, humidity_pct: 54.73, solar_irradiance_wm2: 112.0 },
  { timestamp: "2015-06-16 17:00:00", ambient_temp_c: 34.35, humidity_pct: 49.34, solar_irradiance_wm2: 52.0 },
  { timestamp: "2015-06-16 18:00:00", ambient_temp_c: 35.37, humidity_pct: 56.92, solar_irradiance_wm2: 16.0 },
  { timestamp: "2015-06-16 19:00:00", ambient_temp_c: 32.13, humidity_pct: 56.42, solar_irradiance_wm2: 2.0 },
  { timestamp: "2015-06-16 20:00:00", ambient_temp_c: 29.96, humidity_pct: 59.13, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-16 21:00:00", ambient_temp_c: 29.05, humidity_pct: 57.81, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-16 22:00:00", ambient_temp_c: 26.46, humidity_pct: 56.26, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-16 23:00:00", ambient_temp_c: 27.87, humidity_pct: 57.77, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-17 00:00:00", ambient_temp_c: 24.58, humidity_pct: 65.01, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-17 01:00:00", ambient_temp_c: 25.47, humidity_pct: 61.99, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-17 02:00:00", ambient_temp_c: 22.91, humidity_pct: 60.79, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-17 03:00:00", ambient_temp_c: 23.80, humidity_pct: 63.52, solar_irradiance_wm2: 4.0 },
  { timestamp: "2015-06-17 04:00:00", ambient_temp_c: 24.53, humidity_pct: 63.60, solar_irradiance_wm2: 29.0 },
  { timestamp: "2015-06-17 05:00:00", ambient_temp_c: 26.23, humidity_pct: 59.96, solar_irradiance_wm2: 84.0 },
  { timestamp: "2015-06-17 06:00:00", ambient_temp_c: 25.95, humidity_pct: 66.33, solar_irradiance_wm2: 142.0 },
  { timestamp: "2015-06-17 07:00:00", ambient_temp_c: 25.68, humidity_pct: 61.19, solar_irradiance_wm2: 203.0 },
  { timestamp: "2015-06-17 08:00:00", ambient_temp_c: 31.68, humidity_pct: 62.35, solar_irradiance_wm2: 258.0 },
  { timestamp: "2015-06-17 09:00:00", ambient_temp_c: 31.74, humidity_pct: 60.43, solar_irradiance_wm2: 302.0 },
  { timestamp: "2015-06-17 10:00:00", ambient_temp_c: 31.19, humidity_pct: 54.46, solar_irradiance_wm2: 329.0 },
  { timestamp: "2015-06-17 11:00:00", ambient_temp_c: 31.54, humidity_pct: 59.23, solar_irradiance_wm2: 330.0 },
  { timestamp: "2015-06-17 12:00:00", ambient_temp_c: 34.64, humidity_pct: 55.02, solar_irradiance_wm2: 319.0 },
  { timestamp: "2015-06-17 13:00:00", ambient_temp_c: 36.63, humidity_pct: 55.45, solar_irradiance_wm2: 302.0 },
  { timestamp: "2015-06-17 14:00:00", ambient_temp_c: 37.93, humidity_pct: 45.52, solar_irradiance_wm2: 272.0 },
];

export const PRESET_SCENARIOS = [
  {
    name: "Baseline (7 PM)",
    reading: {
      timestamp: "2015-06-16 19:00:00",
      ambient_temp_c: 32.5,
      humidity_pct: 60.0,
      solar_irradiance_wm2: 450.0,
    },
    description: "Original project test scenario at 7:00 PM."
  },
  {
    name: "Evening Peak (6–10 PM)",
    reading: {
      timestamp: "2024-07-20 19:30:00",
      ambient_temp_c: 33.8,
      humidity_pct: 58.0,
      solar_irradiance_wm2: 12.0,
    },
    description: "Peak rates! Battery switches on automatically."
  },
  {
    name: "Heatwave Red Alert",
    reading: {
      timestamp: "2024-07-20 14:00:00",
      ambient_temp_c: 38.5,
      humidity_pct: 52.0,
      solar_irradiance_wm2: 680.0,
    },
    description: "Heavy AC cooling pushes power over 200 kW."
  },
  {
    name: "Quiet Night",
    reading: {
      timestamp: "2024-07-21 03:00:00",
      ambient_temp_c: 21.5,
      humidity_pct: 72.0,
      solar_irradiance_wm2: 0.0,
    },
    description: "Low power usage safely fed by city grid."
  },
  {
    name: "Sunny Noon",
    reading: {
      timestamp: "2024-07-20 12:00:00",
      ambient_temp_c: 29.0,
      humidity_pct: 48.0,
      solar_irradiance_wm2: 780.0,
    },
    description: "Free solar energy powers load & charges battery."
  }
];
