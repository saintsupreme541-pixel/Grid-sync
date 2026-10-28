from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

def run_prediction_and_control(input_df: pd.DataFrame):
    hours = pd.to_datetime(input_df["timestamp"]).dt.hour
    base_load = 120.0 + 30.0 * np.sin(2 * np.pi * (hours - 6) / 24)
    cooling_load = np.maximum(0.0, input_df["ambient_temp_c"] - 24.0) * 8.5
    predictions = (base_load + cooling_load).values

    results = []
    for i, pred in enumerate(predictions):
        timestamp_str = str(input_df.iloc[i]["timestamp"])
        dt = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
        hour = dt.hour

        is_peak_hours = (18 <= hour <= 22)
        renewable_storage_mode = (pred > 160.0) or is_peak_hours
        grid_mode = "Renewable Storage Mode" if renewable_storage_mode else "Main Grid Mode"
        critical_overload = pred >= 200.0

        results.append({
            "timestamp": timestamp_str,
            "predicted_demand_kw": round(float(pred), 2),
            "grid_mode": grid_mode,
            "critical_overload_alert": bool(critical_overload)
        })
    return results

@app.route('/api/evaluate', methods=['POST'])
def evaluate_telemetry():
    try:
        req_data = request.get_json()
        if not req_data or "data" not in req_data:
            return jsonify({"error": "Invalid payload. Expected 'data' list."}), 400

        input_df = pd.DataFrame(req_data["data"])
        evaluations = run_prediction_and_control(input_df)
        return jsonify({"status": "success", "results": evaluations})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)