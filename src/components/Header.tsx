import React from 'react';
import { Terminal, Activity, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRunBatch: () => void;
  onOpenQuickMl: () => void;
  isEvaluating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onRunBatch,
  onOpenQuickMl,
  isEvaluating,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'controller', label: 'Live Controller' },
    { id: 'forecast', label: '24h Load Curve' },
    { id: 'topology', label: 'Power Topology' },
    { id: 'batch', label: 'Batch Telemetry' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c1017]/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: GridSync Brand Mark with Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onTabChange('dashboard'); }}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <img
                src="/assets/aistudio/GridSync_Smart_Energy_Logo_7bfd38c5.png"
                alt="GridSync Logo"
                className="h-10 w-10 object-contain rounded-lg p-0.5 bg-white/5 border border-slate-700/80 group-hover:border-cyan-400/60 transition-all shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap leading-tight">
                  Grid<span className="text-emerald-400">Sync</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase whitespace-nowrap">
                  Predict · Switch · Stay Powered
                </span>
              </div>
            </a>
          </div>

          {/* Zone 2: 4-5 single-line clean navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                  activeTab === item.id
                    ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenQuickMl}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>QuickML Spec</span>
            </button>

            <button
              onClick={onRunBatch}
              disabled={isEvaluating}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 active:opacity-90 rounded-lg transition-all whitespace-nowrap shrink-0 shadow cursor-pointer disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Run 24h Forecast</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center gap-4 overflow-x-auto py-2.5 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`text-xs font-medium whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === item.id
                  ? 'text-cyan-400 font-semibold border-b border-cyan-400'
                  : 'text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
