import os

base = r"e:\FreshFlow\freshflow"

# 1. OffersClientTable.tsx
p1 = os.path.join(base, r"components\offers\OffersClientTable.tsx")
with open(p1, "r", encoding="utf-8") as f: c1 = f.read()
c1 = c1.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { useTranslations, useFormatter } from 'next-intl';")
c1 = c1.replace("function formatEur(n: number): string {", "export default function OffersClientTable({ offers, userId }: any) {\n  const format = useFormatter();\n  // ... wait, better to inject it into the component.")
# actually I should just re-write the top level formatter to use Intl.NumberFormat or move it inside the component.
# Wait, let's just make them pure functions using regular Intl.NumberFormat since they are pure functions right now outside the component!
# Or better: inject `const format = useFormatter();` inside the component and pass it to functions, or just put the functions inside the component.
