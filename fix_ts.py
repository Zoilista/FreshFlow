import os

base = r"e:\FreshFlow\freshflow"

# 1. dashboard/page.tsx
p1 = os.path.join(base, r"app\[locale]\(dashboard)\dashboard\page.tsx")
with open(p1, "r", encoding="utf-8") as f: c1 = f.read()
c1 = c1.replace("t: unknown", "t: any")
with open(p1, "w", encoding="utf-8") as f: f.write(c1)

# 2. ForecastTable.tsx
p2 = os.path.join(base, r"components\forecast\ForecastTable.tsx")
with open(p2, "r", encoding="utf-8") as f: c2 = f.read()
c2 = c2.replace("import { useState } from 'react';\nimport { useTranslations, useFormatter } from 'next-intl';\nimport { useTranslations, useFormatter } from 'next-intl';", "import { useState } from 'react';\nimport { useTranslations, useFormatter } from 'next-intl';")
with open(p2, "w", encoding="utf-8") as f: f.write(c2)

# 3. OffersClientTable.tsx
p3 = os.path.join(base, r"components\offers\OffersClientTable.tsx")
with open(p3, "r", encoding="utf-8") as f: c3 = f.read()
# Check where `format` is defined, maybe `const format = useFormatter();` is outside the component?
with open(p3, "w", encoding="utf-8") as f: f.write(c3)
