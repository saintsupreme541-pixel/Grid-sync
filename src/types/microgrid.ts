export type GridMode = 'Renewable Storage Mode' | 'Main Grid Mode';

export interface TelemetryReading {
  id?: string;
  timestamp: string;
  ambient_temp_c: number;
  humidity_pct: number;
  solar_irradiance_wm2: number;
}

export interface EvaluationResult {
  id: string;
  timestamp: string;
  hour: number;
  ambient_temp_c: number;
  humidity_pct: number;
  solar_irradiance_wm2: number;
  base_load_kw: number;
  cooling_load_kw: number;
  predicted_demand_kw: number;
  grid_mode: GridMode;
  critical_overload_alert: boolean;
  is_peak_hours: boolean;
  // Microgrid dispatch physics simulation:
  solar_generation_kw: number;
  battery_soc_pct: number;
  battery_flow_kw: number; // positive = discharging, negative = charging
  main_grid_draw_kw: number;
  // Human-friendly contextual insights:
  simple_explanation: string;
  equivalent_homes_powered: number;
  cost_savings_usd: number;
  carbon_saved_kg: number;
  grid_stress_level: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface MicrogridSummary {
  currentDemand: number;
  peakDemand: number;
  averageDemand: number;
  gridMode: GridMode;
  isOverload: boolean;
  batterySoc: number;
  solarOutput: number;
  co2SavedKg: number;
}

