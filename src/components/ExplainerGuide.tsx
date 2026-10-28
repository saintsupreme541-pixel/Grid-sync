import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sun, Moon, Flame, Zap, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { PRESET_SCENARIOS } from '../data/sampleDataset';

interface ExplainerGuideProps {
  onSelectPreset: (preset: typeof PRESET_SCENARIOS[0]) => void;
  activePresetName?: string;
}

export const ExplainerGuide: React.FC<ExplainerGuideProps> = ({
  onSelectPreset,
  activePresetName,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#131d2e] to-slate-900 border border-cyan-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3.5">
          <img
            src="/assets/aistudio/GridSync_Smart_Energy_Logo_7bfd38c5.png"
            alt="GridSync Logo"
            className="w-12 h-12 object-contain rounded-xl p-1 bg-white/5 border border-cyan-400/40 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                GridSync: Smart Microgrid Automated Energy Dispatcher
              </h2>
              <span className="text-[11px] font-medium bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Predict · Switch · Stay Powered
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              An intelligent energy management system that predicts hourly power demand and switches between the Main Grid and Renewable Battery Storage to cut costs and prevent blackouts.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700 transition-colors cursor-pointer self-start sm:self-center"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isOpen ? 'Collapse Guide' : 'Explain The System'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 space-y-5 pt-4 border-t border-slate-800/80 animate-fade-in text-xs">
          {/* 3 Clear Rules in Plain English */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              The 3 Rules It Follows:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Rule 1 */}
              <div className="bg-[#0c1017]/90 border border-emerald-500/30 rounded-lg p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Moon className="w-4 h-4" />
                    <span>1. Peak Hours (6–10 PM)</span>
                  </div>
                  <p className="mt-2 text-slate-300 text-xs leading-relaxed">
                    City rates surge when families get home. GridSync switches to battery power to save money.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-300 font-mono-data">
                  Action: Battery Storage Mode
                </div>
              </div>

              {/* Rule 2 */}
              <div className="bg-[#0c1017]/90 border border-cyan-500/30 rounded-lg p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>2. Power Spikes (&gt; 160 kW)</span>
                  </div>
                  <p className="mt-2 text-slate-300 text-xs leading-relaxed">
                    When usage jumps past 160 kW, the battery discharges to shave the peak and avoid utility penalty fees.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-cyan-300 font-mono-data">
                  Action: Battery Storage Mode
                </div>
              </div>

              {/* Rule 3 */}
              <div className="bg-[#0c1017]/90 border border-red-500/30 rounded-lg p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span>3. Danger Alarm (≥ 200 kW)</span>
                  </div>
                  <p className="mt-2 text-slate-300 text-xs leading-relaxed">
                    Overheating risk! Triggers a critical overload alarm and fires the battery at maximum output.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-red-300 font-mono-data">
                  Action: Red Overload Alarm
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Storyteller: Click-to-Test */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300">
                Try a scenario:
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Live interactive simulation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Preset 1: Sunny Noon */}
              <button
                onClick={() => onSelectPreset(PRESET_SCENARIOS[4])}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  activePresetName === PRESET_SCENARIOS[4].name
                    ? 'bg-amber-950/40 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                    : 'bg-slate-900/70 border-slate-700/80 text-slate-300 hover:border-amber-400/60'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Sunny Noon</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Strong sun generates clean solar power and recharges our battery.
                </p>
                <div className="mt-2 text-[10px] text-amber-300 font-mono-data">
                  Charging Battery
                </div>
              </button>

              {/* Preset 2: Evening Peak */}
              <button
                onClick={() => onSelectPreset(PRESET_SCENARIOS[1])}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  activePresetName === PRESET_SCENARIOS[1].name
                    ? 'bg-emerald-950/40 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400'
                    : 'bg-slate-900/70 border-slate-700/80 text-slate-300 hover:border-emerald-400/60'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
                  <Moon className="w-3.5 h-3.5" />
                  <span>7 PM Peak Rush</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Peak rate window active. Battery takes over to cut electric costs.
                </p>
                <div className="mt-2 text-[10px] text-emerald-300 font-mono-data">
                  Battery Storage Mode
                </div>
              </button>

              {/* Preset 3: Heatwave Overload */}
              <button
                onClick={() => onSelectPreset(PRESET_SCENARIOS[2])}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  activePresetName === PRESET_SCENARIOS[2].name
                    ? 'bg-red-950/40 border-red-400 text-red-200 ring-1 ring-red-400'
                    : 'bg-slate-900/70 border-slate-700/80 text-slate-300 hover:border-red-400/60'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-red-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Heatwave Overload</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  38.5°C heat pushes AC past 200 kW, sounding the red alert.
                </p>
                <div className="mt-2 text-[10px] text-red-400 font-mono-data">
                  Red Alert (≥200 kW)
                </div>
              </button>

              {/* Preset 4: Quiet Night */}
              <button
                onClick={() => onSelectPreset(PRESET_SCENARIOS[3])}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  activePresetName === PRESET_SCENARIOS[3].name
                    ? 'bg-blue-950/40 border-blue-400 text-blue-200 ring-1 ring-blue-400'
                    : 'bg-slate-900/70 border-slate-700/80 text-slate-300 hover:border-blue-400/60'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-blue-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Quiet Night</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Cool air and low power usage (&lt;160 kW). Powered safely by the city grid.
                </p>
                <div className="mt-2 text-[10px] text-blue-300 font-mono-data">
                  Main Grid Mode
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
