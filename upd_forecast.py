import json

path = r"e:\FreshFlow\freshflow\messages\en\forecast.json"
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

data["table"]["title"] = "Surplus Risk Table"
data["table"]["subtitle"] = "{filtered} of {total} products shown"
data["table"]["colCategory"] = "Category"
data["table"]["colRiskLevel"] = "Risk Level"
data["table"]["colRiskScore"] = "Risk Score"
data["table"]["colAtRisk"] = "At Risk Value"
data["table"]["colAction"] = "Action"
data["table"]["createOffer"] = "Create Offer"
data["table"]["monitor"] = "Monitor"
data["table"]["empty"] = "No products match the selected filter."

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated en/forecast.json")
