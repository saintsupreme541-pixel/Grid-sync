import React from 'react';
import { EvaluationResult } from '../types/microgrid';
import {
  AlertTriangle,
  BatteryCharging,
  Zap,
  Sun,
  Home,
  DollarSign,
  Leaf,
  Info,
  CheckCircle2
} from 'lucide-react';

interface MetricCardsProps {
  currentResult: EvaluationResult;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ currentResult }) => {
  const isOverload = currentResult.critical_overload_alert;
  const isRenewable = currentResult.grid_mode === 'Renewable Storage Mode';

  // Stress badge styling
  const stressColors = {
    Low: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
    Moderate: 'bg-blue-950/40 text-blue-300 border-blue-500/30',
    High: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
    Critical: 'bg-red-950/60 text-red-200 border-red-500/50 animate-pulse',
  };

  return (
    <div className="space-y-4">
      {/* 1. Critical Overload Alert */}
      {isOverload && (
        <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-3.5 text-red-100 flex items-center gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-red-200">Red Alert (≥200 kW): </span>
            <span>Power use hit {currentResult.predicted_demand_kw} kW! Battery is discharging at full speed to stop blackouts.</span>
          </div>
        </div>
      )}

      {/* 2. Live Decision Banner */}
      <div className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        isOverload
          ? 'bg-red-950/30 border-red-500/40'
          : isRenewable
          ? 'bg-emerald-950/30 border-emerald-500/40'
          : 'bg-blue-950/30 border-blue-500/40'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isOverload
              ? 'bg-red-500/20 text-red-400'
              : isRenewable
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Live Decision:</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${stressColors[currentResult.grid_stress_level]}`}>
                {currentResult.grid_stress_level} Stress
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentResult.simple_explanation}
            </p>
          </div>
        </div>

        {/* Real-world Impact */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Powers:</span>
            <span className="font-bold text-white font-mono-data">~{currentResult.equivalent_homes_powered} Homes</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Saves:</span>
            <span className="font-bold text-emerald-300 font-mono-data">${currentResult.cost_savings_usd}/hr</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
            <Leaf className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400">Carbon:</span>
            <span className="font-bold text-teal-300 font-mono-data">-{currentResult.carbon_saved_kg} kg/hr</span>
          </div>
        </div>
      </div>

      {/* 3. The 4 Clean Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Power Source */}
        <div className="bg-[#131b26] border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Power Source</span>
            <Zap className={`w-4 h-4 ${isRenewable ? 'text-emerald-400' : 'text-blue-400'}`} />
          </div>

          <div className="mt-2 text-lg font-bold text-white flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isRenewable ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
            <span>{currentResult.grid_mode}</span>
          </div>

          <div className="mt-2 text-xs text-slate-400">
            {isRenewable ? 'Clean battery inverter active' : 'Standard city grid connected'}
          </div>
        </div>

        {/* Card 2: Electricity Usage */}
        <div className="bg-[#131b26] border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Electricity Demand</span>
            <span className={`text-xs font-mono-data font-bold ${isOverload ? 'text-red-400' : 'text-cyan-400'}`}>
              Limit 200 kW
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-data text-white">
              {currentResult.predicted_demand_kw.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-400">kW</span>
          </div>

          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOverload ? 'bg-red-500' : currentResult.predicted_demand_kw > 160 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, (currentResult.predicted_demand_kw / 220) * 100)}%` }}
            ></div>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Steady &lt;160 kW</span>
            <span className="text-red-400">Overload 200 kW</span>
          </div>
        </div>

        {/* Card 3: Battery Level (BESS) */}
        <div className="bg-[#131b26] border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200">Battery Level</span>
              <div className="text-[10px] text-slate-500">Like a giant power bank</div>
            </div>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-data text-white">
              {currentResult.battery_soc_pct.toFixed(0)}%
            </span>
            <span className="text-xs font-medium text-slate-400">Charged</span>
          </div>

          <div className="mt-2 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                currentResult.battery_soc_pct < 20 ? 'bg-red-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${currentResult.battery_soc_pct}%` }}
            ></div>
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            {currentResult.battery_flow_kw > 0 ? (
              <span className="text-amber-300">Supplying {currentResult.battery_flow_kw.toFixed(0)} kW to facility</span>
            ) : currentResult.battery_flow_kw < 0 ? (
              <span className="text-emerald-300">Charging at {Math.abs(currentResult.battery_flow_kw).toFixed(0)} kW from solar</span>
            ) : (
              <span className="text-slate-400">Standby on full charge</span>
            )}
          </div>
        </div>

        {/* Card 4: Weather & Solar Sunlight */}
        <div className="bg-[#131b26] border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200">Outdoor Weather</span>
              <div className="text-[10px] text-slate-500">Drives AC cooling needs</div>
            </div>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-data text-white">
              {currentResult.ambient_temp_c.toFixed(1)}°C
            </span>
            <span className="text-xs text-slate-400 font-mono-data">
              ({((currentResult.ambient_temp_c * 9) / 5 + 32).toFixed(0)}°F)
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between items-center">
            <span>
              Sunlight: <strong className="text-amber-300 font-mono-data">{currentResult.solar_irradiance_wm2.toFixed(0)} W/m²</strong>
            </span>
            <span>
              Solar: <strong className="text-emerald-300 font-mono-data">+{currentResult.solar_generation_kw.toFixed(0)} kW</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
