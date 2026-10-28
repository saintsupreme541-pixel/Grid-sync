import React from 'react';
import { EvaluationResult } from '../types/microgrid';
import { Sun, Battery, Building2, Cable, ArrowRight, ArrowDown, Sparkles, CheckCircle2 } from 'lucide-react';

interface PowerFlowDiagramProps {
  reading: EvaluationResult;
}

export const PowerFlowDiagram: React.FC<PowerFlowDiagramProps> = ({ reading }) => {
  const isOverload = reading.critical_overload_alert;
  const isRenewable = reading.grid_mode === 'Renewable Storage Mode';
  const isDischarging = reading.battery_flow_kw > 0;
  const isCharging = reading.battery_flow_kw < 0;

  return (
    <div className="bg-[#131b26] border border-slate-800 rounded-xl p-5">
      {/* Title & Simple Explanatory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Live Power Flow Map</span>
            <span className="text-xs font-normal text-slate-400">
              (Watch where electricity is coming from and going right now)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            The smart controller balances City Power, Solar, and Battery Storage automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Active Mode:</span>
          <span className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 ${
            isRenewable
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isRenewable ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
            {reading.grid_mode}
          </span>
        </div>
      </div>

      {/* The Visual Grid Flow */}
      <div className="relative mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left Column: The 3 Power Sources */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>Energy Sources (Supply)</span>
          </div>

          {/* Source 1: City Power Grid */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            !isRenewable
              ? 'bg-blue-950/30 border-blue-500/60 shadow-md ring-1 ring-blue-500/30'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Cable className="w-4 h-4 text-blue-400" />
                1. City Grid
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                !isRenewable ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {!isRenewable ? 'Active' : 'Off'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Standard city power. Best when rates are low and usage is steady.
            </p>
            <div className="mt-2.5 flex items-baseline justify-between text-xs pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">Power:</span>
              <span className="text-sm font-bold font-mono-data text-white">
                {reading.main_grid_draw_kw.toFixed(1)} kW
              </span>
            </div>
          </div>

          {/* Source 2: Solar Panels */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                2. Solar Panels
              </span>
              <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                Clean Solar
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Turns sunlight into power and charges the battery during the day.
            </p>
            <div className="mt-2.5 flex items-baseline justify-between text-xs pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">Generating:</span>
              <span className="text-sm font-bold font-mono-data text-amber-300">
                +{reading.solar_generation_kw.toFixed(1)} kW
              </span>
            </div>
          </div>

          {/* Source 3: Battery Energy Storage System (BESS) */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isRenewable
              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Battery className={`w-4 h-4 ${isRenewable ? 'text-emerald-400' : 'text-slate-400'}`} />
                3. Battery Bank
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                isDischarging ? 'bg-emerald-500/20 text-emerald-300' : isCharging ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {isDischarging ? 'Discharging' : isCharging ? 'Charging' : 'Standby'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              500 kWh power bank. Steps in during peak rates (6–10 PM) or spikes.
            </p>
            <div className="mt-2.5 flex items-baseline justify-between text-xs pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">Level &amp; Flow:</span>
              <span className="text-sm font-bold font-mono-data text-emerald-300">
                {reading.battery_soc_pct.toFixed(0)}% · {isDischarging ? `-${reading.battery_flow_kw.toFixed(0)} kW` : isCharging ? `+${Math.abs(reading.battery_flow_kw).toFixed(0)} kW` : 'Idle'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Smart Microgrid Controller (The Brain) */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#0c1017] border-2 border-cyan-500/40 rounded-xl text-center relative overflow-hidden shadow-xl">
          <img
            src="/assets/aistudio/GridSync_Smart_Energy_Logo_7bfd38c5.png"
            alt="GridSync Dispatcher"
            className="w-16 h-16 object-contain rounded-2xl bg-white/5 border-2 border-cyan-400/80 p-1 shadow-lg"
          />

          <h3 className="mt-3 text-base font-bold text-white tracking-tight">
            Grid<span className="text-emerald-400">Sync</span> Dispatcher
          </h3>
          <span className="text-[11px] text-cyan-300 font-semibold tracking-wider uppercase mt-0.5">
            Predict · Switch · Stay Powered
          </span>

          <p className="mt-1.5 text-xs text-slate-300 max-w-xs leading-relaxed">
            Directs electricity flow in real time based on demand forecasts, peak hours, and weather data.
          </p>

          <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-lg w-full text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Selected Source:</span>
              <strong className={isRenewable ? 'text-emerald-400' : 'text-blue-400'}>
                {isRenewable ? 'Battery Storage' : 'City Grid'}
              </strong>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Why Chosen?</span>
              <span className="text-[11px] text-cyan-300 font-semibold text-right">
                {reading.is_peak_hours ? '6–10 PM Peak Rate Window' : reading.predicted_demand_kw > 160 ? 'Surge > 160 kW' : 'Low Cost Off-Peak Hours'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <span>Delivers Power</span>
            <ArrowRight className="w-4 h-4" />
            <span className="text-white">To Our Building</span>
          </div>
        </div>

        {/* Right Column: The Consumer Facility & Load Center */}
        <div className={`p-5 rounded-xl border transition-all ${
          isOverload
            ? 'bg-red-950/40 border-2 border-red-500 shadow-xl'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2 text-sm">
              <Building2 className={`w-5 h-5 ${isOverload ? 'text-red-400' : 'text-cyan-400'}`} />
              4. Facility &amp; Offices
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              isOverload ? 'bg-red-500 text-white animate-bounce' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {isOverload ? 'OVERLOAD SPIKE' : 'STABLE SUPPLY'}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            The destination where all electricity is consumed (lighting, computers, servers, and air conditioning).
          </p>

          <div className="mt-4 p-4 bg-[#0c1017] rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Current Electricity Need:</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono-data ${isOverload ? 'text-red-400' : 'text-white'}`}>
                {reading.predicted_demand_kw.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-400">kW</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enough to power approximately <strong className="text-white font-mono-data">~{reading.equivalent_homes_powered} typical homes</strong> at this instant.
            </p>
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Base Equipment Load:</span>
              <span className="font-mono-data text-white">{reading.base_load_kw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">AC Cooling (Hot Weather):</span>
              <span className="font-mono-data text-amber-300">+{reading.cooling_load_kw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 font-semibold">
              <span className="text-slate-400">Remaining Safety Margin:</span>
              <span className={`font-mono-data ${200 - reading.predicted_demand_kw < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {(200 - reading.predicted_demand_kw).toFixed(1)} kW before overload
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
