import os

# 1. Update Forecast Page
forecast_page_path = os.path.join("app", "[locale]", "(dashboard)", "forecast", "page.tsx")
with open(forecast_page_path, "r", encoding="utf-8") as f:
    forecast_content = f.read()

# Instead of complex replace, we will just completely replace the file with translated version
# Wait, let's look at the forecast page content.
# Since it's large, we can just replace static strings in the file.

replacements_forecast = [
    ("import { getForecasts } from '@/lib/repositories/forecasts.repository';", "import { getForecasts } from '@/lib/repositories/forecasts.repository';\nimport { getTranslations, getFormatter } from 'next-intl/server';"),
    ("export default async function ForecastPage() {", "export default async function ForecastPage() {\n  const t = await getTranslations('forecast.page');\n  const format = await getFormatter();"),
    ("Demand Forecast", "{t('title')}"),
    ("AI-powered predictions for the next 7 days based on your sales history.", "{t('subtitle')}"),
    ("Avg. Accuracy", "{t('stats.avgAccuracy')}"),
    ("Projected Sales (7d)", "{t('stats.projectedSales')}"),
    ("Waste Risk Level", "{t('stats.wasteRisk')}"),
    ("Action recommended", "{t('stats.wasteRiskSub')}"),
    ("Missing Data", "{t('alerts.missingData')}"),
    ("No forecast data available. Please upload your latest inventory data.", "{t('alerts.missingDataDesc')}"),
    ("€${totalProjectedValue}", "{format.number(totalProjectedValue, {style: 'currency', currency: 'EUR', minimumFractionDigits: 0})}"),
    ("riskScore > 70 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW'", "riskScore > 70 ? t('stats.riskHigh') : riskScore > 30 ? t('stats.riskMedium') : t('stats.riskLow')")
]

for old, new in replacements_forecast:
    forecast_content = forecast_content.replace(old, new)

with open(forecast_page_path, "w", encoding="utf-8") as f:
    f.write(forecast_content)


# 2. Update ForecastTable Client Component
forecast_table_path = os.path.join("components", "forecast", "ForecastTable.tsx")
with open(forecast_table_path, "r", encoding="utf-8") as f:
    forecast_table_content = f.read()

replacements_ft = [
    ("import { ForecastResultRow } from '@/types/database';", "import { ForecastResultRow } from '@/types/database';\nimport { useTranslations, useFormatter } from 'next-intl';"),
    ("export default function ForecastTable({ initialData }: { initialData: ForecastResultRow[] }) {", "export default function ForecastTable({ initialData }: { initialData: ForecastResultRow[] }) {\n  const t = useTranslations('forecast.table');\n  const format = useFormatter();"),
    ('"Search products..."', 't("searchPlaceholder")'),
    ("<th>Product</th>", "<th>{t('colProduct')}</th>"),
    ("<th>Current Stock</th>", "<th>{t('colStock')}</th>"),
    ("<th>Expected Demand (7d)</th>", "<th>{t('colDemand')}</th>"),
    ("<th>Confidence</th>", "<th>{t('colConfidence')}</th>"),
    ("<th>Waste Risk</th>", "<th>{t('colRisk')}</th>"),
    ("<th>Action</th>", "<th>{t('action')}</th>"),
    ("Manage", "{t('btnManage')}"),
    ("No forecast data yet.", "{t('empty')}"),
    ("Upload your sales and inventory data to generate forecasts.", "{t('emptyDesc')}"),
    ("Upload Data", "{t('btnUpload')}"),
    ("Filter", "{t('btnFilter')}"),
    ('{item.confidence_level === \'high\' ? 85 : item.confidence_level === \'medium\' ? 65 : 45}%', '{format.number((item.confidence_level === \'high\' ? 85 : item.confidence_level === \'medium\' ? 65 : 45) / 100, {style: "percent", maximumFractionDigits: 0})}'),
    ('{item.waste_risk_score}/100', '{item.waste_risk_score}/100')
]

for old, new in replacements_ft:
    forecast_table_content = forecast_table_content.replace(old, new)

with open(forecast_table_path, "w", encoding="utf-8") as f:
    f.write(forecast_table_content)


# 3. Update Impact Page
impact_page_path = os.path.join("app", "[locale]", "(dashboard)", "impact", "page.tsx")
with open(impact_page_path, "r", encoding="utf-8") as f:
    impact_content = f.read()

replacements_impact = [
    ("import { getCumulativeImpact, getMonthlyImpacts } from '@/lib/repositories/impact.repository';", "import { getCumulativeImpact, getMonthlyImpacts } from '@/lib/repositories/impact.repository';\nimport { getTranslations, getFormatter } from 'next-intl/server';"),
    ("export default async function ImpactPage() {", "export default async function ImpactPage() {\n  const t = await getTranslations('impact.page');\n  const format = await getFormatter();"),
    ("Impact Report", "{t('title')}"),
    ("Track the environmental and financial impact of your waste reduction efforts.", "{t('subtitle')}"),
    ("Waste Prevented", "{t('stats.wastePrevented')}"),
    ("Revenue Saved", "{t('stats.revenueSaved')}"),
    ("CO₂ Avoided", "{t('stats.co2Avoided')}"),
    ("Environmental Impact Trends", "{t('chart.title')}"),
    ("Waste Prevented (kg)", "{t('chart.wasteLabel')}"),
    ("CO₂ Avoided (kg)", "{t('chart.co2Label')}"),
    ("Monthly Breakdown", "{t('details.title')}"),
    ("<th>Period</th>", "<th>{t('details.colPeriod')}</th>"),
    ("<th>Waste Prevented</th>", "<th>{t('details.colWaste')}</th>"),
    ("<th>Revenue Saved</th>", "<th>{t('details.colRevenue')}</th>"),
    ("<th>CO₂ Avoided</th>", "<th>{t('details.colCO2')}</th>"),
    ("No impact data available yet.", "{t('details.empty')}"),
    ("Your impact metrics will appear here once you start preventing waste.", "{t('details.emptyDesc')}"),
    ("formatKg(cumulative?.waste_kg_prevented ?? 0)", "formatKg(cumulative?.waste_kg_prevented ?? 0)"),
    ("formatEur(cumulative?.revenue_saved_eur ?? 0)", "format.number(cumulative?.revenue_saved_eur ?? 0, {style: 'currency', currency: 'EUR', minimumFractionDigits: 0})"),
    ("formatKg(cumulative?.co2_saved_kg ?? 0)", "formatKg(cumulative?.co2_saved_kg ?? 0)"),
    ("formatEur(row.revenue_saved_eur)", "format.number(row.revenue_saved_eur, {style: 'currency', currency: 'EUR', minimumFractionDigits: 0})"),
    ("formatKg(row.waste_kg_prevented)", "formatKg(row.waste_kg_prevented)"),
    ("formatKg(row.co2_saved_kg)", "formatKg(row.co2_saved_kg)")
]

for old, new in replacements_impact:
    impact_content = impact_content.replace(old, new)

with open(impact_page_path, "w", encoding="utf-8") as f:
    f.write(impact_content)

print("Forecast and Impact TSX localized.")
