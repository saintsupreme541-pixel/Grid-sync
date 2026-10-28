import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface QuickMlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickMlModal: React.FC<QuickMlModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const curlSnippet = `curl -X POST http://localhost:3000/api/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": [
      {
        "timestamp": "2015-06-16 19:00:00",
        "ambient_temp_c": 32.5,
        "humidity_pct": 60.0,
        "solar_irradiance_wm2": 450.0
      }
    ]
  }'`;

  const predictPySnippet = `# HackSphere 3.0 CLI Execution
python predict.py --input sample_test_input.csv --output predictions.csv

# Pre-submission verification
python test_eval.py`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131b26] border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/GridSync_Smart_Energy_Logo_7bfd38c5.png"
              alt="GridSync"
              className="w-10 h-10 object-contain rounded-lg p-0.5 bg-white/5 border border-cyan-400/50 shadow"
            />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Grid<span className="text-emerald-400">Sync</span> QuickML &amp; Backend API
              </h2>
              <p className="text-xs text-slate-400">
                Zoho Catalyst &amp; HackSphere 3.0 demand forecasting architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-xs leading-relaxed text-slate-300">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1. Transition Controller Contract
            </h3>
            <p className="text-slate-400">
              Evaluates every row of the 24-hour forecast window to trigger power-source transition signals:
            </p>
            <div className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded font-mono-data space-y-1 text-slate-300">
              <div><span className="text-cyan-300">Renewable Storage Mode:</span> Demand &gt; 160 kW OR Hour ∈ [18:00, 22:00]</div>
              <div><span className="text-blue-300">Main Grid Mode:</span> Demand ≤ 160 kW AND Hour ∉ [18:00, 22:00]</div>
              <div><span className="text-red-400">Critical Overload Alert:</span> Demand ≥ 200 kW (Independent)</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-sm font-semibold text-white">
                2. Live API Testing Endpoint (POST /api/evaluate)
              </h3>
              <button
                onClick={() => copyToClipboard(curlSnippet, 'curl')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'curl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'curl' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#0c1017] border border-slate-800 rounded text-slate-300 font-mono-data overflow-x-auto text-[11px]">
              {curlSnippet}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-sm font-semibold text-white">
                3. CLI Execution &amp; test_eval.py Checklist
              </h3>
              <button
                onClick={() => copyToClipboard(predictPySnippet, 'cli')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'cli' ? 'Copied' : 'Copy CLI'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#0c1017] border border-slate-800 rounded text-slate-300 font-mono-data overflow-x-auto text-[11px]">
              {predictPySnippet}
            </pre>
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded text-cyan-200">
            <span className="font-semibold text-cyan-300">QuickML Endpoint:</span>
            <div className="mt-1 font-mono-data text-[11px] text-slate-300 break-all">
              https://api.catalyst.zoho.in/quickml/v1/project/103440000000013023/endpoints/predict
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 rounded transition-colors cursor-pointer"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};
