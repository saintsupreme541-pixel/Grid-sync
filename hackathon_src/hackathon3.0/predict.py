from datetime import datetime
import numpy as np
import pandas as pd
import requests

# Your published Zoho Catalyst QuickML Endpoint URL
QUICKML_ENDPOINT_URL = (
    "https://api.catalyst.zoho.in/quickml/v1/project/103440000000013023/endpoints/predict"
)


def predict(input_df: pd.DataFrame):
  predictions = []
  online_success = True

  if QUICKML_ENDPOINT_URL != "YOUR_PUBLISHED_QUICKML_ENDPOINT_URL_HERE":
    try:
      # Let's test just the first row to inspect the server error clearly if it fails
      row = input_df.iloc[0]
      payload = {
          "data": {
              "ambient_temp_c": float(row["ambient_temp_c"]),
              "humidity_pct": float(row["humidity_pct"]),
              "solar_irradiance_wm2": float(row["solar_irradiance_wm2"]),
          }
      }

      response = requests.post(QUICKML_ENDPOINT_URL, json=payload, timeout=10)
      
      # Print server response text if it's not a 200 OK
      if response.status_code != 200:
        print(f"\n[DEBUG] Server Error Response: {response.text}\n")
        
      response.raise_for_status()

      # If row 1 works, loop through all rows
      for _, r in input_df.iterrows():
        p_payload = {
            "data": {
                "ambient_temp_c": float(r["ambient_temp_c"]),
                "humidity_pct": float(r["humidity_pct"]),
                "solar_irradiance_wm2": float(r["solar_irradiance_wm2"]),
            }
        }
        res = requests.post(QUICKML_ENDPOINT_URL, json=p_payload, timeout=10)
        res.raise_for_status()
        res_json = res.json()
        
        pred_val = res_json.get("prediction", {}).get("target_demand_kw")
        if pred_val is None:
          pred_val = list(res_json.values())[0]
        predictions.append(float(pred_val))

      return np.array(predictions, dtype=float)

    except Exception as e:
      print(
          f"Warning: QuickML endpoint call failed ({e}). Using local fallback"
          " simulation."
      )
      online_success = False

  # Fallback simulation if offline or error occurs
  if not online_success:
    hours = pd.to_datetime(input_df["timestamp"]).dt.hour
    base_load = 120.0 + 30.0 * np.sin(2 * np.pi * (hours - 6) / 24)
    cooling_load = np.maximum(0.0, input_df["ambient_temp_c"] - 24.0) * 8.5
    dummy_predictions = (base_load + cooling_load).values
    return np.array(dummy_predictions, dtype=float)


def evaluate_grid_controller(input_df: pd.DataFrame, predictions):
  results = []
  for i, pred in enumerate(predictions):
    timestamp_str = str(input_df.iloc[i]["timestamp"])
    dt = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
    hour = dt.hour

    is_peak_hours = 18 <= hour <= 22
    renewable_storage_mode = (pred > 160.0) or is_peak_hours
    grid_mode = (
        "Renewable Storage Mode"
        if renewable_storage_mode
        else "Main Grid Mode"
    )
    critical_overload = pred >= 200.0

    results.append({
        "timestamp": timestamp_str,
        "predicted_demand_kw": round(float(pred), 2),
        "grid_mode": grid_mode,
        "critical_overload_alert": bool(critical_overload),
    })
  return results


if __name__ == "__main__":
  print("Testing predict.py on sample_test_input.csv...")
  try:
    sample_df = pd.read_csv("sample_test_input.csv")
    preds = predict(sample_df)
    print(
        f"Generated {len(preds)} predictions. First 5 samples:\n{preds[:5]}"
    )

    decisions = evaluate_grid_controller(sample_df, preds)
    print("\n--- Sample Grid Controller Decisions ---")
    for d in decisions[:3]:
      print(d)

  except FileNotFoundError:
    print(
        "sample_test_input.csv not found in directory. Please verify the file"
        " name."
    )