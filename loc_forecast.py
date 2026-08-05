import os
import re

path = r"e:\FreshFlow\freshflow\components\forecast\ForecastTable.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace imports
content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { useTranslations, useFormatter } from 'next-intl';")

# Replace formats
content = content.replace("function formatNumber(n: number | null | undefined, unit = ''): string {\n  if (n == null) return '—';\n  return `${Math.round(n * 100) / 100}${unit ? ' ' + unit : ''}`;\n}", "")
content = content.replace("function formatEur(n: number): string {\n  return n > 0 ? `€${Math.round(n).toLocaleString()}` : '—';\n}", "")

# Inject formatter and translations
injection = """
  const t = useTranslations('forecast');
  const format = useFormatter();

  const formatNumber = (n: number | null | undefined, unit = '') => {
    if (n == null) return '—';
    return `${format.number(n, { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
  };

  const formatEur = (n: number) => {
    return n > 0 ? format.number(n, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : '—';
  };
"""
content = content.replace("const [activeFilter, setActiveFilter] = useState<FilterType>('all');", "const [activeFilter, setActiveFilter] = useState<FilterType>('all');\n" + injection)

# Replace hardcoded strings
content = content.replace("Surplus Risk Table", "{t('table.title')}")
content = content.replace("{filtered.length} of {predictions.length} products shown", "{t('table.subtitle', { filtered: filtered.length, total: predictions.length })}")
content = content.replace("['Product', 'Category', 'Current Stock', 'Forecast Demand (7d)', 'Risk Level', 'Risk Score', 'At Risk Value', 'Action']", "[t('table.colProduct'), t('table.colCategory'), t('table.colStock'), t('table.colDemand'), t('table.colRiskLevel'), t('table.colRiskScore'), t('table.colAtRisk'), t('table.colAction')]")
content = content.replace("Create Offer", "{t('table.createOffer')}")
content = content.replace("Monitor", "{t('table.monitor')}")
content = content.replace("No products match the selected filter.", "{t('table.empty')}")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("ForecastTable localized.")
