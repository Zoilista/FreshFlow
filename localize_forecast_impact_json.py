import os
import json

# 1. Update English JSON for Forecast & Impact
forecast_json_path = os.path.join("messages", "en", "forecast.json")
impact_json_path = os.path.join("messages", "en", "impact.json")

forecast_data = {
  "page": {
    "title": "Demand Forecast",
    "subtitle": "AI-powered predictions for the next 7 days based on your sales history.",
    "stats": {
      "avgAccuracy": "Avg. Accuracy",
      "projectedSales": "Projected Sales (7d)",
      "wasteRisk": "Waste Risk Level",
      "wasteRiskSub": "Action recommended",
      "riskLow": "LOW",
      "riskMedium": "MEDIUM",
      "riskHigh": "HIGH"
    },
    "alerts": {
      "missingData": "Missing Data",
      "missingDataDesc": "No forecast data available. Please upload your latest inventory data."
    }
  },
  "table": {
    "searchPlaceholder": "Search products...",
    "btnFilter": "Filter",
    "colProduct": "Product",
    "colStock": "Current Stock",
    "colDemand": "Expected Demand (7d)",
    "colConfidence": "Confidence",
    "colRisk": "Waste Risk",
    "action": "Action",
    "btnManage": "Manage",
    "empty": "No forecast data yet.",
    "emptyDesc": "Upload your sales and inventory data to generate forecasts.",
    "btnUpload": "Upload Data"
  }
}

impact_data = {
  "page": {
    "title": "Impact Report",
    "subtitle": "Track the environmental and financial impact of your waste reduction efforts.",
    "stats": {
      "wastePrevented": "Waste Prevented",
      "revenueSaved": "Revenue Saved",
      "co2Avoided": "CO₂ Avoided"
    },
    "chart": {
      "title": "Environmental Impact Trends",
      "wasteLabel": "Waste Prevented (kg)",
      "co2Label": "CO₂ Avoided (kg)",
      "month": "Month"
    },
    "details": {
      "title": "Monthly Breakdown",
      "colPeriod": "Period",
      "colWaste": "Waste Prevented",
      "colRevenue": "Revenue Saved",
      "colCO2": "CO₂ Avoided",
      "empty": "No impact data available yet.",
      "emptyDesc": "Your impact metrics will appear here once you start preventing waste."
    }
  }
}

with open(forecast_json_path, "w", encoding="utf-8") as f:
    json.dump(forecast_data, f, indent=2, ensure_ascii=False)

with open(impact_json_path, "w", encoding="utf-8") as f:
    json.dump(impact_data, f, indent=2, ensure_ascii=False)

print("Forecast and Impact JSON created.")
