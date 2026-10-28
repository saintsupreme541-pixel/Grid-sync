import React, { useState, useRef } from 'react';
import { EvaluationResult, GridMode } from '../types/microgrid';
import { Upload, Download, Search, FileText, CheckCircle2, AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';
import { generateSubmissionPredictionsCsv, generateDetailedTelemetryCsv } from '../services/energyEngine';

interface BatchTelemetryTableProps {
  results: EvaluationResult[];
  onUploadCsv: (file: File) => void;
  onResetSample: () => void;
  onSelectRow: (index: number) => void;
  selectedIndex: number;
}

export const BatchTelemetryTable: React.FC<BatchTelemetryTableProps> = ({
  results,
  onUploadCsv,
  onResetSample,
  onSelectRow,
  selectedIndex,
}) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = results.filter((item) => {
    if (filterMode === 'renewable' && item.grid_mode !== 'Renewable Storage Mode') return false;
    if (filterMode === 'grid' && item.grid_mode !== 'Main Grid Mode') return false;
    if (filterMode === 'overload' && !item.critical_overload_alert) return false;
    if (searchQuery.trim()) {
      return item.timestamp.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleDownloadPredictions = () => {
    const csvContent = generateSubmissionPredictionsCsv(results);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'predictions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFullDiagnostics = () => {
    const csvContent = generateDetailedTelemetryCsv(results);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'microgrid_telemetry_eval.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onUploadCsv(files[0]);
    }
  };

  return (
    <div className="bg-[#131b26] border border-slate-800 rounded-xl p-5">
      {/* Header with Title & Plain English helper */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>24-Hour Telemetry Log</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hour-by-hour forecast. Click any row to view its live power flow above.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload My CSV</span>
          </button>

          <button
            onClick={onResetSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Load 24h Sample</span>
          </button>

          <button
            onClick={handleDownloadPredictions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-sm"
            title="Exports timestamp,target_demand_kw for hackathon evaluation"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export predictions.csv</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Hours ({results.length})
          </button>
          <button
            onClick={() => setFilterMode('renewable')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'renewable'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Battery Mode ({results.filter(r => r.grid_mode === 'Renewable Storage Mode').length})
          </button>
          <button
            onClick={() => setFilterMode('grid')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'grid'
                ? 'bg-blue-500/20 text-blue-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            City Grid ({results.filter(r => r.grid_mode === 'Main Grid Mode').length})
          </button>
          <button
            onClick={() => setFilterMode('overload')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'overload'
                ? 'bg-red-500/20 text-red-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overloads ({results.filter(r => r.critical_overload_alert).length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by time/date..."
            className="w-full bg-[#0c1017] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono-data focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* High-density Readable Data Table */}
      <div className="mt-4 border border-slate-800 rounded-xl overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Time / Date</th>
              <th className="py-2.5 px-3 font-semibold text-right">Hour</th>
              <th className="py-2.5 px-3 font-semibold text-right">Temp (°C)</th>
              <th className="py-2.5 px-3 font-semibold text-right">Sunlight</th>
              <th className="py-2.5 px-3 font-semibold text-right">Predicted Power</th>
              <th className="py-2.5 px-3 font-semibold">Smart Decision</th>
              <th className="py-2.5 px-3 font-semibold">Why Did It Switch?</th>
              <th className="py-2.5 px-3 font-semibold text-center">Safety Alert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No telemetry rows matching current filter.
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => {
                const isSelected = results.indexOf(row) === selectedIndex;
                const isOverload = row.critical_overload_alert;
                const isRenewable = row.grid_mode === 'Renewable Storage Mode';

                let reasonText = '';
                if (isOverload) {
                  reasonText = 'Danger: Usage ≥ 200 kW';
                } else if (row.is_peak_hours && row.predicted_demand_kw > 160) {
                  reasonText = 'Peak Hours (6-10 PM) & >160 kW';
                } else if (row.is_peak_hours) {
                  reasonText = 'Peak Window (6-10 PM)';
                } else if (row.predicted_demand_kw > 160) {
                  reasonText = 'Usage > 160 kW';
                } else {
                  reasonText = 'Low cost off-peak';
                }

                return (
                  <tr
                    key={row.id || idx}
                    onClick={() => onSelectRow(results.indexOf(row))}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 text-white font-medium'
                        : isOverload
                        ? 'bg-red-950/20 hover:bg-red-950/30 text-red-200'
                        : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3 font-mono-data whitespace-nowrap">
                      {row.timestamp}
                    </td>
                    <td className="py-2 px-3 font-mono-data text-right text-slate-400">
                      {row.hour}:00
                    </td>
                    <td className="py-2 px-3 font-mono-data text-right">
                      {row.ambient_temp_c.toFixed(1)}°C
                    </td>
                    <td className="py-2 px-3 font-mono-data text-right text-amber-300">
                      {row.solar_irradiance_wm2.toFixed(0)} W/m²
                    </td>
                    <td className="py-2 px-3 font-mono-data text-right font-bold text-white">
                      {row.predicted_demand_kw.toFixed(1)} kW
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 font-bold ${
                        isRenewable ? 'text-emerald-400' : 'text-blue-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isRenewable ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                        {row.grid_mode}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-xs">
                      {reasonText}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isOverload ? (
                        <span className="text-red-400 font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          OVERLOAD
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Stable</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
