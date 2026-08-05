import os

forecast_table_path = os.path.join("components", "forecast", "ForecastTable.tsx")
with open(forecast_table_path, "r", encoding="utf-8") as f:
    forecast_table_content = f.read()

# Fix the broken state variable names
forecast_table_content = forecast_table_content.replace(
    "const [active{t('btnFilter')}, setActive{t('btnFilter')}] = useState<{t('btnFilter')}Type",
    "const [activeFilter, setActiveFilter] = useState<FilterType"
)
forecast_table_content = forecast_table_content.replace(
    "active{t('btnFilter')} === 'all'",
    "activeFilter === 'all'"
)
forecast_table_content = forecast_table_content.replace(
    "if (active{t('btnFilter')} === 'critical')",
    "if (activeFilter === 'critical')"
)
forecast_table_content = forecast_table_content.replace(
    "if (active{t('btnFilter')} === 'high')",
    "if (activeFilter === 'high')"
)
forecast_table_content = forecast_table_content.replace(
    "if (active{t('btnFilter')} === 'medium')",
    "if (activeFilter === 'medium')"
)
forecast_table_content = forecast_table_content.replace(
    "if (active{t('btnFilter')} === 'low')",
    "if (activeFilter === 'low')"
)
forecast_table_content = forecast_table_content.replace(
    "setActive{t('btnFilter')}",
    "setActiveFilter"
)
forecast_table_content = forecast_table_content.replace(
    "active{t('btnFilter')}",
    "activeFilter"
)

with open(forecast_table_path, "w", encoding="utf-8") as f:
    f.write(forecast_table_content)

print("Fixed ForecastTable state variable names.")
