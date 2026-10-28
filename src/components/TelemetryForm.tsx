import React, { useState } from 'react';
import { TelemetryReading, EvaluationResult } from '../types/microgrid';
import { PRESET_SCENARIOS } from '../data/sampleDataset';
import { Sliders, Play, Server, Cpu, Check, AlertTriangle, HelpCircle, Thermometer, Droplets, Sun, Clock } from 'lucide-react';

interface TelemetryFormProps {
  currentReading: TelemetryReading;
  onEvaluate: (reading: TelemetryReading, useBackend: boolean) => void;
  lastResult?: EvaluationResult;
  isEvaluating?: boolean;
}

export const TelemetryForm: React.FC<TelemetryFormProps> = ({
  currentReading,
  onEvaluate,
  lastResult,
  isEvaluating,
}) => {
  const [formState, setFormState] = useState<TelemetryReading>(currentReading);
  const [useBackend, setUseBackend] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('Original Project Default');

  const handleSelectPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setSelectedPreset(preset.name);
    setFormState(preset.reading);
    onEvaluate(preset.reading, useBackend);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEvaluate(formState, useBackend);
  };

  const handleInputChange = (field: keyof TelemetryReading, value: any) => {
    const updated = {
      ...formState,
      [field]: field === 'timestamp' ? value : parseFloat(value) || 0,
    };
    setFormState(updated);
  };

  return (
    <div className="bg-[#131b26] border border-slate-800 rounded-xl p-5">
      {/* Title with plain English subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Interactive Simulator: Test Your Own Conditions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Adjust the sliders below to see how outside weather and time of day trigger automatic grid switching.
          </p>
        </div>

        {/* Engine mode toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-center">
          <button
            type="button"
            onClick={() => setUseBackend(false)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              !useBackend ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Instant Engine</span>
          </button>
          <button
            type="button"
            onClick={() => setUseBackend(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              useBackend ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Backend API</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Story Presets */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Try A Real-World Test Scenario:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {PRESET_SCENARIOS.map((p) => {
            const isSelected = selectedPreset === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`p-2.5 rounded-lg text-left border transition-all text-xs cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold truncate text-[11px]">{p.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* The 4 Intuitive Input Sliders */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input 1: Timestamp */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-start mb-1">
              <div>
                <label htmlFor="timestamp" className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Date &amp; Time
                </label>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Hours 18 to 22 (6 PM–10 PM) trigger peak battery mode
                </span>
              </div>
            </div>
            <input
              type="text"
              id="timestamp"
              value={formState.timestamp}
              onChange={(e) => handleInputChange('timestamp', e.target.value)}
              className="w-full mt-2 bg-[#0c1017] border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-cyan-400"
              placeholder="2015-06-16 19:00:00"
            />
          </div>

          {/* Input 2: Ambient Temperature */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-start mb-1">
              <div>
                <label htmlFor="temp" className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  Outside Temperature
                </label>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Above 24°C, air conditioning load increases
                </span>
              </div>
              <span className="text-xs font-mono-data text-amber-300 font-bold">
                {formState.ambient_temp_c.toFixed(1)}°C ({((formState.ambient_temp_c * 9) / 5 + 32).toFixed(0)}°F)
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min="10"
                max="45"
                step="0.5"
                value={formState.ambient_temp_c}
                onChange={(e) => handleInputChange('ambient_temp_c', e.target.value)}
                className="flex-1 accent-amber-400 cursor-pointer"
              />
              <input
                type="number"
                id="temp"
                step="0.1"
                value={formState.ambient_temp_c}
                onChange={(e) => handleInputChange('ambient_temp_c', e.target.value)}
                className="w-16 bg-[#0c1017] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono-data text-right focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Input 3: Relative Humidity */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-start mb-1">
              <div>
                <label htmlFor="humidity" className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  Relative Humidity (%)
                </label>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Atmospheric moisture level
                </span>
              </div>
              <span className="text-xs font-mono-data text-blue-300 font-bold">
                {formState.humidity_pct.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={formState.humidity_pct}
                onChange={(e) => handleInputChange('humidity_pct', e.target.value)}
                className="flex-1 accent-blue-400 cursor-pointer"
              />
              <input
                type="number"
                id="humidity"
                step="0.5"
                value={formState.humidity_pct}
                onChange={(e) => handleInputChange('humidity_pct', e.target.value)}
                className="w-16 bg-[#0c1017] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono-data text-right focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Input 4: Solar Irradiance */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/90">
            <div className="flex justify-between items-start mb-1">
              <div>
                <label htmlFor="solar" className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  Sunlight Power (Solar Irradiance)
                </label>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  0 at night, up to 1000 W/m² at full sunny noon
                </span>
              </div>
              <span className="text-xs font-mono-data text-amber-200 font-bold">
                {formState.solar_irradiance_wm2.toFixed(0)} W/m²
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={formState.solar_irradiance_wm2}
                onChange={(e) => handleInputChange('solar_irradiance_wm2', e.target.value)}
                className="flex-1 accent-amber-300 cursor-pointer"
              />
              <input
                type="number"
                id="solar"
                step="10"
                value={formState.solar_irradiance_wm2}
                onChange={(e) => handleInputChange('solar_irradiance_wm2', e.target.value)}
                className="w-16 bg-[#0c1017] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono-data text-right focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Tests these conditions against all 3 switching rules.
          </p>

          <button
            type="submit"
            disabled={isEvaluating}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded-lg transition-all shadow cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Check Grid Decision</span>
          </button>
        </div>
      </form>

      {/* Decision Output Result */}
      {lastResult && (
        <div className="mt-4 p-3.5 bg-slate-900 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-300 leading-relaxed font-medium">
            <span className="font-bold text-white">Decision: </span>
            {lastResult.simple_explanation}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
            <div className="p-2.5 bg-[#0c1017] rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Usage</span>
              <div className="text-base font-bold font-mono-data text-white">
                {lastResult.predicted_demand_kw} kW
              </div>
              <span className="text-[10px] text-slate-400">~{lastResult.equivalent_homes_powered} homes</span>
            </div>

            <div className="p-2.5 bg-[#0c1017] rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Source</span>
              <div className={`text-sm font-bold ${
                lastResult.grid_mode === 'Renewable Storage Mode' ? 'text-emerald-400' : 'text-blue-400'
              }`}>
                {lastResult.grid_mode}
              </div>
              <span className="text-[10px] text-slate-400">
                {lastResult.grid_mode === 'Renewable Storage Mode' ? 'Discharging battery' : 'City power'}
              </span>
            </div>

            <div className="p-2.5 bg-[#0c1017] rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Status</span>
              <div className="text-xs font-semibold flex items-center gap-1 mt-0.5">
                {lastResult.critical_overload_alert ? (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Overload Alert
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Normal Operation
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">Limit 200 kW</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
