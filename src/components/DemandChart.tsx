import React, { useState } from 'react';
import { EvaluationResult } from '../types/microgrid';
import { HelpCircle, Clock, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

interface DemandChartProps {
  results: EvaluationResult[];
  selectedIndex: number;
  onSelectReading: (index: number) => void;
}

export const DemandChart: React.FC<DemandChartProps> = ({
  results,
  selectedIndex,
  onSelectReading,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!results || results.length === 0) {
    return (
      <div className="bg-[#131b26] border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
        No forecast data available. Click "Run 24h Forecast" to calculate demand load curves.
      </div>
    );
  }

  // Chart dimensions & scaling:
  const chartHeight = 250;
  const chartWidth = 920;
  const padding = { top: 35, right: 35, bottom: 45, left: 60 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const maxVal = Math.max(225, ...results.map(r => r.predicted_demand_kw));
  const minVal = 80;

  const getX = (index: number) => {
    return padding.left + (index / (results.length - 1 || 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return padding.top + innerHeight - ((clamped - minVal) / (maxVal - minVal)) * innerHeight;
  };

  const demandPoints = results.map((r, i) => `${getX(i)},${getY(r.predicted_demand_kw)}`).join(' ');
  const basePoints = results.map((r, i) => `${getX(i)},${getY(r.base_load_kw)}`).join(' ');
  const areaPath = `M ${getX(0)},${getY(minVal)} L ${results.map((r, i) => `${getX(i)},${getY(r.predicted_demand_kw)}`).join(' L ')} L ${getX(results.length - 1)},${getY(minVal)} Z`;

  const y160 = getY(160);
  const y200 = getY(200);

  const activeIdx = hoveredIdx !== null ? hoveredIdx : selectedIndex;
  const activeReading = results[activeIdx] || results[0];

  return (
    <div className="bg-[#131b26] border border-slate-800 rounded-xl p-5">
      {/* Header with Title and Plain English Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>24-Hour Forecast Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any hour to see how GridSync balances power throughout the day.
          </p>
        </div>

        {/* Legend with plain language explanations */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-3.5 h-1 bg-cyan-400 rounded-full"></span>
            <span className="font-semibold">Predicted Usage</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-400"></span>
            <span>160 kW Battery Trigger</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="w-3.5 h-0.5 border-t-2 border-red-500"></span>
            <span className="font-semibold">200 kW Danger Alarm</span>
          </div>
        </div>
      </div>

      {/* SVG Timeline */}
      <div className="mt-4 relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[700px] select-none"
        >
          <defs>
            <linearGradient id="friendlyDemandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
            </linearGradient>
            <pattern id="friendlyPeakPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M-2,2 l4,-4 M0,10 l10,-10 M8,12 l4,-4" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" />
            </pattern>
          </defs>

          {/* Grid lines for Y-axis with clean numerical marks */}
          {[100, 130, 160, 190, 220].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="11"
                  textAnchor="end"
                  className="font-mono-data"
                >
                  {level} kW
                </text>
              </g>
            );
          })}

          {/* Shaded 18:00 - 22:00 Peak Window with clear text header */}
          {results.map((r, i) => {
            if (r.hour >= 18 && r.hour <= 22) {
              const xStart = getX(Math.max(0, i - 0.5));
              const xEnd = getX(Math.min(results.length - 1, i + 0.5));
              return (
                <rect
                  key={`peak-${i}`}
                  x={xStart}
                  y={padding.top}
                  width={xEnd - xStart}
                  height={innerHeight}
                  fill="url(#friendlyPeakPattern)"
                />
              );
            }
            return null;
          })}

          {/* 160 kW Threshold Line */}
          <line
            x1={padding.left}
            y1={y160}
            x2={chartWidth - padding.right}
            y2={y160}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="5 5"
            opacity="0.85"
          />
          <text
            x={chartWidth - padding.right}
            y={y160 - 6}
            fill="#f59e0b"
            fontSize="11"
            textAnchor="end"
            className="font-semibold"
          >
            160 kW: Switches to Battery Storage
          </text>

          {/* 200 kW Danger Alert Line */}
          <line
            x1={padding.left}
            y1={y200}
            x2={chartWidth - padding.right}
            y2={y200}
            stroke="#ef4444"
            strokeWidth="2"
            opacity="0.95"
          />
          <text
            x={chartWidth - padding.right}
            y={y200 - 6}
            fill="#ef4444"
            fontSize="11"
            textAnchor="end"
            className="font-bold"
          >
            200 kW: Overload Danger Alarm!
          </text>

          {/* Shaded Area under curve */}
          <path d={areaPath} fill="url(#friendlyDemandGradient)" />

          {/* Base sine wave */}
          <polyline
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            points={basePoints}
          />

          {/* Main Demand Line */}
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            points={demandPoints}
          />

          {/* Interactive clickable hour dots */}
          {results.map((r, i) => {
            const cx = getX(i);
            const cy = getY(r.predicted_demand_kw);
            const isSelected = i === selectedIndex;
            const isHovered = i === hoveredIdx;
            const isOver = r.critical_overload_alert;
            const isStorage = r.grid_mode === 'Renewable Storage Mode';

            return (
              <g
                key={r.id || i}
                onClick={() => onSelectReading(i)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={cx - 12}
                  y={padding.top}
                  width={24}
                  height={innerHeight}
                  fill="transparent"
                />

                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected || isHovered ? 7 : 4}
                  fill={isOver ? '#ef4444' : isStorage ? '#10b981' : '#06b6d4'}
                  stroke="#0c1017"
                  strokeWidth="2.5"
                  className="transition-all"
                />

                {/* Hour label below */}
                {i % 2 === 0 && (
                  <text
                    x={cx}
                    y={chartHeight - 12}
                    fill={isSelected ? '#38bdf8' : '#94a3b8'}
                    fontSize="11"
                    textAnchor="middle"
                    className="font-mono-data font-medium"
                  >
                    {r.hour}:00
                  </text>
                )}
              </g>
            );
          })}

          {/* Vertical guide line on active hour */}
          {activeReading && (
            <line
              x1={getX(activeIdx)}
              y1={padding.top}
              x2={getX(activeIdx)}
              y2={chartHeight - padding.bottom}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="2 2"
              opacity="0.9"
              pointerEvents="none"
            />
          )}
        </svg>
      </div>

      {/* Interactive scrubber detail card */}
      <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white font-bold text-sm flex items-center gap-2">
              <span>Selected Time: {activeReading.timestamp} ({activeReading.hour}:00)</span>
              {activeReading.is_peak_hours && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Evening Peak Window
                </span>
              )}
            </div>
            <p className="text-slate-300 text-xs mt-0.5">
              {activeReading.simple_explanation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div>
            <span className="text-slate-400 block text-[11px]">Usage</span>
            <span className="text-sm font-bold text-cyan-300 font-mono-data">
              {activeReading.predicted_demand_kw} kW
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Dispatch Decision</span>
            <span className={`text-sm font-bold ${
              activeReading.grid_mode === 'Renewable Storage Mode' ? 'text-emerald-400' : 'text-blue-400'
            }`}>
              {activeReading.grid_mode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
