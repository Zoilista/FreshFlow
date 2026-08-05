import os

# 1. fix layout.tsx import
layout_path = os.path.join("app", "[locale]", "layout.tsx")
with open(layout_path, "r", encoding="utf-8") as f:
    layout_content = f.read()

layout_content = layout_content.replace('import "./globals.css";', 'import "../globals.css";')

with open(layout_path, "w", encoding="utf-8") as f:
    f.write(layout_content)

# 2. fix surplus/page.tsx import
surplus_page_path = os.path.join("app", "[locale]", "(dashboard)", "surplus", "page.tsx")
with open(surplus_page_path, "r", encoding="utf-8") as f:
    surplus_page_content = f.read()

surplus_page_content = surplus_page_content.replace(
    "import { getSurplusPredictions } from '@/lib/repositories/surplus.repository';", 
    "import { getSurplusPredictions } from '@/lib/repositories/forecasts.repository';"
)

with open(surplus_page_path, "w", encoding="utf-8") as f:
    f.write(surplus_page_content)

# 3. fix ForecastTable.tsx type alias
forecast_table_path = os.path.join("components", "forecast", "ForecastTable.tsx")
with open(forecast_table_path, "r", encoding="utf-8") as f:
    forecast_table_content = f.read()

forecast_table_content = forecast_table_content.replace(
    "type {t('btnFilter')}Type = 'all' | 'critical' | 'high' | 'medium' | 'low';",
    "type FilterType = 'all' | 'critical' | 'high' | 'medium' | 'low';"
)
forecast_table_content = forecast_table_content.replace(
    "value: {t('btnFilter')}Type",
    "value: FilterType"
)
forecast_table_content = forecast_table_content.replace(
    "const [filter, set{t('btnFilter')}] = useState<{t('btnFilter')}Type>('all');",
    "const [filter, setFilter] = useState<FilterType>('all');"
)
forecast_table_content = forecast_table_content.replace(
    "set{t('btnFilter')}",
    "setFilter"
)
forecast_table_content = forecast_table_content.replace(
    "{t('btnFilter')} === 'all'",
    "filter === 'all'"
)
forecast_table_content = forecast_table_content.replace(
    "if ({t('btnFilter')} === 'critical')",
    "if (filter === 'critical')"
)
forecast_table_content = forecast_table_content.replace(
    "if ({t('btnFilter')} === 'high')",
    "if (filter === 'high')"
)
forecast_table_content = forecast_table_content.replace(
    "if ({t('btnFilter')} === 'medium')",
    "if (filter === 'medium')"
)
forecast_table_content = forecast_table_content.replace(
    "if ({t('btnFilter')} === 'low')",
    "if (filter === 'low')"
)

with open(forecast_table_path, "w", encoding="utf-8") as f:
    f.write(forecast_table_content)

# 4. fix impact/page.tsx label quote
impact_page_path = os.path.join("app", "[locale]", "(dashboard)", "impact", "page.tsx")
with open(impact_page_path, "r", encoding="utf-8") as f:
    impact_page_content = f.read()

impact_page_content = impact_page_content.replace(
    "label: '{t('stats.wastePrevented')}'",
    "label: t('stats.wastePrevented')"
)
impact_page_content = impact_page_content.replace(
    "label: '{t('stats.revenueSaved')}'",
    "label: t('stats.revenueSaved')"
)
impact_page_content = impact_page_content.replace(
    "label: '{t('stats.co2Avoided')}'",
    "label: t('stats.co2Avoided')"
)
with open(impact_page_path, "w", encoding="utf-8") as f:
    f.write(impact_page_content)

print("Fixes applied.")
