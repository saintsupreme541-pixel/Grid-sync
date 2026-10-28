import { TelemetryReading, EvaluationResult, GridMode } from '../types/microgrid';

/**
 * Parses timestamp string to extract the hour of the day (0-23).
 * Supports both standard "YYYY-MM-DD HH:MM:SS" and ISO strings.
 */
export function extractHourFromTimestamp(timestampStr: string): number {
  if (!timestampStr) return 12;
  const match = timestampStr.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    return parseInt(match[4], 10);
  }
  const date = new Date(timestampStr.replace(' ', 'T'));
  const hour = date.getHours();
  return isNaN(hour) ? 12 : hour;
}

/**
 * Core HackSphere 3.0 Forecasting & Transition Controller algorithm
 * Faithfully mirrors the Python regression equation from app.py & predict.py.
 */
export function evaluateSingleReading(
  reading: TelemetryReading,
  index: number = 0,
  currentSoc: number = 72
): EvaluationResult {
  const hour = extractHourFromTimestamp(reading.timestamp);

  // 1. Base Load (sine cycle with minimum at night/dawn, maximum at midday/afternoon)
  // Formula: base_load = 120.0 + 30.0 * np.sin(2 * np.pi * (hours - 6) / 24)
  const baseLoad = 120.0 + 30.0 * Math.sin((2 * Math.PI * (hour - 6)) / 24);

  // 2. Cooling Load (extra HVAC load activated above 24°C threshold)
  // Formula: cooling_load = np.maximum(0.0, input_df["ambient_temp_c"] - 24.0) * 8.5
  const coolingLoad = Math.max(0.0, reading.ambient_temp_c - 24.0) * 8.5;

  // 3. Predicted Demand (kW)
  const predictedDemand = baseLoad + coolingLoad;

  // 4. Smart Grid Switching Logic:
  // Condition: Demand > 160 kW OR timestamp hour is between 18:00 and 22:00 inclusive
  const isPeakHours = hour >= 18 && hour <= 22;
  const renewableStorageMode = predictedDemand > 160.0 || isPeakHours;
  const gridMode: GridMode = renewableStorageMode ? 'Renewable Storage Mode' : 'Main Grid Mode';

  // Condition: Demand >= 200 kW triggers Critical Overload Alert
  const criticalOverload = predictedDemand >= 200.0;

  // 5. Realistic Microgrid Power Dispatch Physics:
  // Solar PV generation: based on solar irradiance (e.g., 1000 W/m² = 120 kW solar capacity)
  const solarGenKw = Math.round((Math.max(0, reading.solar_irradiance_wm2) / 1000) * 120 * 10) / 10;

  // Battery Storage dispatch:
  // In Renewable Storage Mode, battery discharges up to 80 kW (subject to available charge)
  // When Solar generation exceeds demand, excess recharges battery.
  let batteryFlowKw = 0;
  let simulatedSoc = currentSoc;

  if (renewableStorageMode) {
    // Discharging to shave peak / fulfill renewable mode requirement
    const targetDischarge = Math.min(80, Math.max(20, predictedDemand - 120));
    batteryFlowKw = currentSoc > 15 ? targetDischarge : 0;
    simulatedSoc = Math.max(10, currentSoc - (batteryFlowKw / 400) * 100);
  } else {
    // Main Grid Mode: if solar is plentiful, recharge battery
    if (solarGenKw > 30) {
      batteryFlowKw = -Math.min(50, solarGenKw * 0.6); // negative means charging
      simulatedSoc = Math.min(98, currentSoc + (Math.abs(batteryFlowKw) / 400) * 100);
    } else {
      batteryFlowKw = 0;
    }
  }

  // Main grid supplies whatever remains:
  const mainGridDraw = Math.max(0, predictedDemand - solarGenKw - Math.max(0, batteryFlowKw));

  // Human-friendly concise insights:
  let simpleExplanation = '';
  let gridStressLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';

  if (criticalOverload) {
    gridStressLevel = 'Critical';
    simpleExplanation = `Dangerously high usage (${predictedDemand.toFixed(1)} kW). Battery is discharging at full speed to protect the grid.`;
  } else if (isPeakHours && predictedDemand > 160.0) {
    gridStressLevel = 'High';
    simpleExplanation = `Peak evening hours (6–10 PM) and high usage. Battery is powering the building to dodge peak electric rates.`;
  } else if (isPeakHours) {
    gridStressLevel = 'High';
    simpleExplanation = `Evening peak hours (6–10 PM). Using stored battery energy while city grid rates are high.`;
  } else if (predictedDemand > 160.0) {
    gridStressLevel = 'High';
    simpleExplanation = `Usage surged past 160 kW. Battery kicked in to shave the spike and prevent utility penalties.`;
  } else {
    gridStressLevel = predictedDemand > 130 ? 'Moderate' : 'Low';
    simpleExplanation = `Running smoothly on city power. Electricity usage is steady and rates are low.`;
  }

  // Real world equivalents:
  const homesEquivalent = Math.max(1, Math.round(predictedDemand / 2.5));
  const batteryDischarge = Math.max(0, batteryFlowKw);
  const costSavings = Math.round((solarGenKw * 0.15 + batteryDischarge * 0.22) * 10) / 10;
  const carbonSaved = Math.round((solarGenKw + batteryDischarge) * 0.42 * 10) / 10;

  return {
    id: reading.id || `eval-${index}-${Date.now()}`,
    timestamp: reading.timestamp,
    hour,
    ambient_temp_c: Number(reading.ambient_temp_c),
    humidity_pct: Number(reading.humidity_pct),
    solar_irradiance_wm2: Number(reading.solar_irradiance_wm2),
    base_load_kw: Math.round(baseLoad * 100) / 100,
    cooling_load_kw: Math.round(coolingLoad * 100) / 100,
    predicted_demand_kw: Math.round(predictedDemand * 100) / 100,
    grid_mode: gridMode,
    critical_overload_alert: criticalOverload,
    is_peak_hours: isPeakHours,
    solar_generation_kw: solarGenKw,
    battery_soc_pct: Math.round(simulatedSoc * 10) / 10,
    battery_flow_kw: Math.round(batteryFlowKw * 10) / 10,
    main_grid_draw_kw: Math.round(mainGridDraw * 100) / 100,
    simple_explanation: simpleExplanation,
    equivalent_homes_powered: homesEquivalent,
    cost_savings_usd: costSavings,
    carbon_saved_kg: carbonSaved,
    grid_stress_level: gridStressLevel,
  };
}

/**
 * Evaluates a 24-hour sequence of telemetry readings with chained battery SoC physics
 */
export function evaluateBatchReadings(readings: TelemetryReading[]): EvaluationResult[] {
  let runningSoc = 65.0; // Start at 65% nominal State of Charge
  const results: EvaluationResult[] = [];

  readings.forEach((reading, idx) => {
    const evaluated = evaluateSingleReading(reading, idx, runningSoc);
    runningSoc = evaluated.battery_soc_pct;
    results.push(evaluated);
  });

  return results;
}

/**
 * Invokes the local/deployed backend API (/api/evaluate) matching app.py contract.
 */
export async function callBackendApi(readings: TelemetryReading[]): Promise<EvaluationResult[]> {
  try {
    const payload = {
      data: readings.map(r => ({
        timestamp: r.timestamp,
        ambient_temp_c: Number(r.ambient_temp_c),
        humidity_pct: Number(r.humidity_pct),
        solar_irradiance_wm2: Number(r.solar_irradiance_wm2),
      }))
    };

    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.results && Array.isArray(data.results)) {
      let runningSoc = 65.0;
      return data.results.map((res: any, idx: number) => {
        const hour = extractHourFromTimestamp(res.timestamp);
        const solarGenKw = Math.round((Math.max(0, res.solar_irradiance_wm2 || 0) / 1000) * 120 * 10) / 10;
        const isRenewable = res.grid_mode === 'Renewable Storage Mode';
        
        let batteryFlow = 0;
        if (isRenewable) {
          batteryFlow = runningSoc > 15 ? Math.min(80, Math.max(20, res.predicted_demand_kw - 120)) : 0;
          runningSoc = Math.max(10, runningSoc - (batteryFlow / 400) * 100);
        } else {
          if (solarGenKw > 30) {
            batteryFlow = -Math.min(50, solarGenKw * 0.6);
            runningSoc = Math.min(98, runningSoc + (Math.abs(batteryFlow) / 400) * 100);
          }
        }

        const mainGrid = Math.max(0, res.predicted_demand_kw - solarGenKw - Math.max(0, batteryFlow));

        const isPeak = hour >= 18 && hour <= 22;
        const isCritical = Boolean(res.critical_overload_alert);
        let explanation = '';
        let stress: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
        if (isCritical) {
          stress = 'Critical';
          explanation = `Emergency power surge (${res.predicted_demand_kw} kW). The battery storage system is discharging at full speed to prevent circuit trips.`;
        } else if (isRenewable) {
          stress = 'High';
          explanation = `Battery Storage active. Supplying clean energy to offset peak rates or heavy load (>160 kW).`;
        } else {
          stress = res.predicted_demand_kw > 130 ? 'Moderate' : 'Low';
          explanation = `Standard city grid power active. Operating safely within normal capacity.`;
        }

        return {
          id: `api-res-${idx}`,
          timestamp: res.timestamp,
          hour,
          ambient_temp_c: res.ambient_temp_c,
          humidity_pct: res.humidity_pct,
          solar_irradiance_wm2: res.solar_irradiance_wm2,
          base_load_kw: res.base_load_kw,
          cooling_load_kw: res.cooling_load_kw,
          predicted_demand_kw: res.predicted_demand_kw,
          grid_mode: res.grid_mode as GridMode,
          critical_overload_alert: isCritical,
          is_peak_hours: isPeak,
          solar_generation_kw: solarGenKw,
          battery_soc_pct: Math.round(runningSoc * 10) / 10,
          battery_flow_kw: Math.round(batteryFlow * 10) / 10,
          main_grid_draw_kw: Math.round(mainGrid * 100) / 100,
          simple_explanation: explanation,
          equivalent_homes_powered: Math.max(1, Math.round(res.predicted_demand_kw / 2.5)),
          cost_savings_usd: Math.round((solarGenKw * 0.15 + Math.max(0, batteryFlow) * 0.22) * 10) / 10,
          carbon_saved_kg: Math.round((solarGenKw + Math.max(0, batteryFlow)) * 0.42 * 10) / 10,
          grid_stress_level: stress,
        };
      });
    }
    throw new Error('Invalid response structure from backend API');
  } catch (err) {
    // If backend network fails, gracefully fall back to deterministic client computation
    console.warn('Backend call failed, using client engine:', err);
    return evaluateBatchReadings(readings);
  }
}

/**
 * Parses CSV file text into TelemetryReading array
 */
export function parseTelemetryCsv(csvText: string): TelemetryReading[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const timestampIdx = headers.findIndex(h => h.includes('timestamp') || h.includes('time') || h.includes('date'));
  const tempIdx = headers.findIndex(h => h.includes('temp') || h.includes('ambient'));
  const humidityIdx = headers.findIndex(h => h.includes('humidity') || h.includes('hum'));
  const solarIdx = headers.findIndex(h => h.includes('solar') || h.includes('irradiance') || h.includes('rad'));

  const readings: TelemetryReading[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    const cols = row.split(',').map(c => c.trim());

    const timestamp = timestampIdx >= 0 && cols[timestampIdx] ? cols[timestampIdx] : `2024-01-01 ${String((i - 1) % 24).padStart(2, '0')}:00:00`;
    const temp = tempIdx >= 0 && !isNaN(parseFloat(cols[tempIdx])) ? parseFloat(cols[tempIdx]) : 25.0;
    const humidity = humidityIdx >= 0 && !isNaN(parseFloat(cols[humidityIdx])) ? parseFloat(cols[humidityIdx]) : 50.0;
    const solar = solarIdx >= 0 && !isNaN(parseFloat(cols[solarIdx])) ? parseFloat(cols[solarIdx]) : 0.0;

    readings.push({
      id: `csv-${i}`,
      timestamp,
      ambient_temp_c: temp,
      humidity_pct: humidity,
      solar_irradiance_wm2: solar,
    });
  }

  return readings;
}

/**
 * Exports predictions in the exact submission format required by HackSphere 3.0 problem statement:
 * timestamp,target_demand_kw
 */
export function generateSubmissionPredictionsCsv(results: EvaluationResult[]): string {
  const lines = ['timestamp,target_demand_kw'];
  for (const r of results) {
    lines.push(`${r.timestamp},${r.predicted_demand_kw.toFixed(2)}`);
  }
  return lines.join('\n');
}

/**
 * Exports detailed grid transition and diagnostic telemetry to CSV
 */
export function generateDetailedTelemetryCsv(results: EvaluationResult[]): string {
  const lines = [
    'timestamp,hour,ambient_temp_c,humidity_pct,solar_irradiance_wm2,base_load_kw,cooling_load_kw,predicted_demand_kw,grid_mode,critical_overload_alert,battery_soc_pct,solar_gen_kw,main_grid_draw_kw'
  ];
  for (const r of results) {
    lines.push(
      [
        r.timestamp,
        r.hour,
        r.ambient_temp_c,
        r.humidity_pct,
        r.solar_irradiance_wm2,
        r.base_load_kw,
        r.cooling_load_kw,
        r.predicted_demand_kw,
        `"${r.grid_mode}"`,
        r.critical_overload_alert,
        r.battery_soc_pct,
        r.solar_generation_kw,
        r.main_grid_draw_kw
      ].join(',')
    );
  }
  return lines.join('\n');
}
