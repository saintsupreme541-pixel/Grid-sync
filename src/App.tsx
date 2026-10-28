import React, { useState } from 'react';
import { Header } from './components/Header';
import { ExplainerGuide } from './components/ExplainerGuide';
import { MetricCards } from './components/MetricCards';
import { PowerFlowDiagram } from './components/PowerFlowDiagram';
import { DemandChart } from './components/DemandChart';
import { TelemetryForm } from './components/TelemetryForm';
import { BatchTelemetryTable } from './components/BatchTelemetryTable';
import { QuickMlModal } from './components/QuickMlModal';
import { TelemetryReading, EvaluationResult } from './types/microgrid';
import { INITIAL_24H_DATASET, PRESET_SCENARIOS } from './data/sampleDataset';
import {
  evaluateSingleReading,
  evaluateBatchReadings,
  callBackendApi,
  parseTelemetryCsv
} from './services/energyEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [batchResults, setBatchResults] = useState<EvaluationResult[]>(() => {
    return evaluateBatchReadings(INITIAL_24H_DATASET);
  });

  const [selectedIndex, setSelectedIndex] = useState<number>(4); // default 19:00 peak hour

  const [formReading, setFormReading] = useState<TelemetryReading>({
    timestamp: '2015-06-16 19:00:00',
    ambient_temp_c: 32.5,
    humidity_pct: 60.0,
    solar_irradiance_wm2: 450.0,
  });

  const [singleResult, setSingleResult] = useState<EvaluationResult>(() => {
    return evaluateSingleReading({
      timestamp: '2015-06-16 19:00:00',
      ambient_temp_c: 32.5,
      humidity_pct: 60.0,
      solar_irradiance_wm2: 450.0,
    });
  });

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isQuickMlOpen, setIsQuickMlOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activePresetName, setActivePresetName] = useState<string>('Original Project Default');

  const activeReading: EvaluationResult =
    activeTab === 'controller'
      ? singleResult
      : batchResults[selectedIndex] || singleResult;

  const handleEvaluateSingle = async (reading: TelemetryReading, useBackend: boolean) => {
    setFormReading(reading);
    setIsEvaluating(true);

    if (useBackend) {
      try {
        const apiResults = await callBackendApi([reading]);
        if (apiResults.length > 0) {
          setSingleResult(apiResults[0]);
          setStatusMessage('Evaluated via backend API.');
        }
      } catch (err) {
        const local = evaluateSingleReading(reading);
        setSingleResult(local);
        setStatusMessage('Backend offline: Evaluated with instant local engine.');
      }
    } else {
      const local = evaluateSingleReading(reading);
      setSingleResult(local);
      setStatusMessage('Calculated in real-time with instant forecasting engine.');
    }

    setIsEvaluating(false);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSelectPresetScenario = (preset: typeof PRESET_SCENARIOS[0]) => {
    setActivePresetName(preset.name);
    setFormReading(preset.reading);
    handleEvaluateSingle(preset.reading, false);
  };

  const handleRunBatch = async () => {
    setIsEvaluating(true);
    try {
      const evaluated = evaluateBatchReadings(
        batchResults.map(r => ({
          timestamp: r.timestamp,
          ambient_temp_c: r.ambient_temp_c,
          humidity_pct: r.humidity_pct,
          solar_irradiance_wm2: r.solar_irradiance_wm2,
        }))
      );
      setBatchResults(evaluated);
      setStatusMessage('Updated 24-hour forecast curve across all hours.');
    } finally {
      setIsEvaluating(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleUploadCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const parsed = parseTelemetryCsv(text);
        if (parsed.length > 0) {
          const evaluated = evaluateBatchReadings(parsed);
          setBatchResults(evaluated);
          setSelectedIndex(0);
          setFormReading({
            timestamp: evaluated[0].timestamp,
            ambient_temp_c: evaluated[0].ambient_temp_c,
            humidity_pct: evaluated[0].humidity_pct,
            solar_irradiance_wm2: evaluated[0].solar_irradiance_wm2,
          });
          setSingleResult(evaluated[0]);
          setStatusMessage(`Analyzed ${parsed.length} rows from ${file.name}.`);
          setTimeout(() => setStatusMessage(null), 4000);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = () => {
    const evaluated = evaluateBatchReadings(INITIAL_24H_DATASET);
    setBatchResults(evaluated);
    setSelectedIndex(4);
    setStatusMessage('Restored standard 24-hour dataset.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSelectBatchRow = (idx: number) => {
    setSelectedIndex(idx);
    const row = batchResults[idx];
    if (row) {
      setFormReading({
        timestamp: row.timestamp,
        ambient_temp_c: row.ambient_temp_c,
        humidity_pct: row.humidity_pct,
        solar_irradiance_wm2: row.solar_irradiance_wm2,
      });
      setSingleResult(row);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunBatch={handleRunBatch}
        onOpenQuickMl={() => setIsQuickMlOpen(true)}
        isEvaluating={isEvaluating}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Status Toast */}
        {statusMessage && (
          <div className="px-4 py-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-xs text-cyan-200 flex items-center justify-between shadow-md">
            <span>{statusMessage}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-cyan-400 hover:text-white ml-2 text-sm cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* 1. Welcoming Beginner-Friendly Explainer Guide */}
        <ExplainerGuide
          onSelectPreset={handleSelectPresetScenario}
          activePresetName={activePresetName}
        />

        {/* 2. Top Metric Cards Strip with Plain English Decisions & Impact */}
        <MetricCards currentResult={activeReading} />

        {/* 3. Dynamic Views based on active tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <PowerFlowDiagram reading={activeReading} />
            <DemandChart
              results={batchResults}
              selectedIndex={selectedIndex}
              onSelectReading={handleSelectBatchRow}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <TelemetryForm
                  currentReading={formReading}
                  onEvaluate={handleEvaluateSingle}
                  lastResult={singleResult}
                  isEvaluating={isEvaluating}
                />
              </div>
              <div className="lg:col-span-6">
                <BatchTelemetryTable
                  results={batchResults}
                  onUploadCsv={handleUploadCsv}
                  onResetSample={handleResetSample}
                  onSelectRow={handleSelectBatchRow}
                  selectedIndex={selectedIndex}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'controller' && (
          <div className="space-y-6">
            <TelemetryForm
              currentReading={formReading}
              onEvaluate={handleEvaluateSingle}
              lastResult={singleResult}
              isEvaluating={isEvaluating}
            />
            <PowerFlowDiagram reading={singleResult} />
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="space-y-6">
            <DemandChart
              results={batchResults}
              selectedIndex={selectedIndex}
              onSelectReading={handleSelectBatchRow}
            />
            <BatchTelemetryTable
              results={batchResults}
              onUploadCsv={handleUploadCsv}
              onResetSample={handleResetSample}
              onSelectRow={handleSelectBatchRow}
              selectedIndex={selectedIndex}
            />
          </div>
        )}

        {activeTab === 'topology' && (
          <div className="space-y-6">
            <PowerFlowDiagram reading={activeReading} />
            <DemandChart
              results={batchResults}
              selectedIndex={selectedIndex}
              onSelectReading={handleSelectBatchRow}
            />
          </div>
        )}

        {activeTab === 'batch' && (
          <div className="space-y-6">
            <BatchTelemetryTable
              results={batchResults}
              onUploadCsv={handleUploadCsv}
              onResetSample={handleResetSample}
              onSelectRow={handleSelectBatchRow}
              selectedIndex={selectedIndex}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#090d13] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/GridSync_Smart_Energy_Logo_7bfd38c5.png"
              alt="GridSync"
              className="h-6 w-6 object-contain rounded"
            />
            <span className="font-bold text-slate-300">GridSync</span>
            <span aria-hidden="true">·</span>
            <span>Predict · Switch · Stay Powered</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">HackSphere 3.0 Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsQuickMlOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              QuickML Specification
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="/sample_test_input.csv"
              download="sample_test_input.csv"
              className="hover:text-slate-300 transition-colors"
            >
              Download Sample CSV
            </a>
          </div>
        </div>
      </footer>

      {/* QuickML & Catalyst Modal */}
      <QuickMlModal
        isOpen={isQuickMlOpen}
        onClose={() => setIsQuickMlOpen(false)}
      />
    </div>
  );
}
