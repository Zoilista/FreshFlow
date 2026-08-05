import os

# 1. OffersClientTable
path = r"e:\FreshFlow\freshflow\components\offers\OffersClientTable.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "import { useTranslations } from 'next-intl';",
    "import { useTranslations, useFormatter } from 'next-intl';"
)
content = content.replace(
    "const t = useTranslations('offers');",
    "const t = useTranslations('offers');\n  const format = useFormatter();"
)
content = content.replace(
    "return `€${Math.round(n).toLocaleString()}`;",
    "return format.number(n, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });"
)
# For time relative formatting
# We can use format.relativeTime
content = content.replace(
    "if (diffMins < 60) return `${diffMins}m ago`;\n    if (diffH < 24) return `${diffH}h ago`;\n    if (diffD < 7) return `${diffD}d ago`;\n    return new Date(isoDate).toLocaleDateString();",
    "if (diffMins < 60) return format.relativeTime(new Date(isoDate));\n    if (diffH < 24) return format.relativeTime(new Date(isoDate));\n    if (diffD < 7) return format.relativeTime(new Date(isoDate));\n    return format.dateTime(new Date(isoDate));"
)
with open(path, "w", encoding="utf-8") as f:
    f.write(content)

# 2. SurplusClientTable
path2 = r"e:\FreshFlow\freshflow\components\surplus\SurplusClientTable.tsx"
with open(path2, "r", encoding="utf-8") as f:
    content2 = f.read()

content2 = content2.replace(
    "import { useState, useTransition } from 'react';",
    "import { useState, useTransition } from 'react';\nimport { useFormatter } from 'next-intl';"
)
content2 = content2.replace(
    "const [isPending, startTransition] = useTransition();",
    "const [isPending, startTransition] = useTransition();\n  const format = useFormatter();"
)
content2 = content2.replace(
    "return `€${Math.round(n).toLocaleString()}`;",
    "return format.number(n, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });"
)
# And the formatting inside:
content2 = content2.replace(
    "`${co2Savings.toFixed(1)} kg`",
    "`${format.number(co2Savings, { maximumFractionDigits: 1 })} kg`"
)
with open(path2, "w", encoding="utf-8") as f:
    f.write(content2)

# 3. Header.tsx
path3 = r"e:\FreshFlow\freshflow\components\dashboard\Header.tsx"
with open(path3, "r", encoding="utf-8") as f:
    content3 = f.read()
    
content3 = content3.replace(
    "import { useTranslations } from 'next-intl';",
    "import { useTranslations, useFormatter } from 'next-intl';"
)
content3 = content3.replace(
    "const t = useTranslations('dashboard');",
    "const t = useTranslations('dashboard');\n  const format = useFormatter();"
)
content3 = content3.replace(
    "new Date().toLocaleDateString('en-US', {\n          weekday: 'long',\n          month: 'long',\n          day: 'numeric'\n        })",
    "format.dateTime(new Date(), {\n          weekday: 'long',\n          month: 'long',\n          day: 'numeric'\n        })"
)
with open(path3, "w", encoding="utf-8") as f:
    f.write(content3)
    
print("Formatting applied.")
