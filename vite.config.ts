import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function microgridApiPlugin(): Plugin {
  return {
    name: 'microgrid-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.end();
          return;
        }

        // Health endpoint
        if (req.url === '/api/health') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            status: 'ok',
            service: 'GridSync Microgrid Forecasting API',
            version: '3.0.0',
            switchingRules: {
              renewableStorageThresholdKw: 160.0,
              peakHoursWindow: '18:00 - 22:00',
              criticalOverloadThresholdKw: 200.0,
            }
          }));
          return;
        }

        if (req.url === '/api/evaluate') {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
            return;
          }

          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', () => {
            try {
              const reqData = JSON.parse(body || '{}');
              let rawRows: any[] = [];

              if (Array.isArray(reqData)) {
                rawRows = reqData;
              } else if (reqData && Array.isArray(reqData.data)) {
                rawRows = reqData.data;
              } else if (reqData && reqData.data && typeof reqData.data === 'object') {
                rawRows = [reqData.data];
              } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify({ error: "Invalid payload. Expected 'data' list or object." }));
                return;
              }

              const results = rawRows.map((row: any) => {
                const timestampStr = String(row.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19));
                const match = timestampStr.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
                let hour = 12;
                if (match) {
                  hour = parseInt(match[4], 10);
                } else {
                  const parsed = new Date(timestampStr.replace(' ', 'T'));
                  hour = isNaN(parsed.getHours()) ? 12 : parsed.getHours();
                }

                const ambientTemp = parseFloat(row.ambient_temp_c) || 25.0;
                const baseLoad = 120.0 + 30.0 * Math.sin((2 * Math.PI * (hour - 6)) / 24);
                const coolingLoad = Math.max(0.0, ambientTemp - 24.0) * 8.5;
                const pred = baseLoad + coolingLoad;

                const isPeakHours = hour >= 18 && hour <= 22;
                const renewableStorageMode = pred > 160.0 || isPeakHours;
                const gridMode = renewableStorageMode ? 'Renewable Storage Mode' : 'Main Grid Mode';
                const criticalOverload = pred >= 200.0;

                const solarGenKw = Math.round((Math.max(0, parseFloat(row.solar_irradiance_wm2) || 0) / 1000) * 120 * 10) / 10;
                const batteryDischarge = renewableStorageMode ? Math.min(80, Math.max(20, pred - 120)) : 0;
                const homesEquivalent = Math.max(1, Math.round(pred / 2.5));

                return {
                  timestamp: timestampStr,
                  predicted_demand_kw: Math.round(pred * 100) / 100,
                  grid_mode: gridMode,
                  critical_overload_alert: criticalOverload,
                  base_load_kw: Math.round(baseLoad * 100) / 100,
                  cooling_load_kw: Math.round(coolingLoad * 100) / 100,
                  ambient_temp_c: ambientTemp,
                  humidity_pct: parseFloat(row.humidity_pct) || 50.0,
                  solar_irradiance_wm2: parseFloat(row.solar_irradiance_wm2) || 0.0,
                  solar_generation_kw: solarGenKw,
                  homes_equivalent: homesEquivalent,
                  is_peak_hours: isPeakHours,
                };
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ status: 'success', results }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ error: err.message || 'Server processing error' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), microgridApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

