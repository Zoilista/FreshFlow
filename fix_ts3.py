import os

base = r"e:\FreshFlow\freshflow"

# 1. OffersClientTable.tsx
p1 = os.path.join(base, r"components\offers\OffersClientTable.tsx")
with open(p1, "r", encoding="utf-8") as f: c1 = f.read()

# Replace top level formatters with Intl equivalents that don't need hooks, or remove `format` error.
c1 = c1.replace(
    "function formatEur(n: number): string {\n  return format.number(n, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });\n}",
    "function formatEur(n: number): string {\n  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);\n}"
)
with open(p1, "w", encoding="utf-8") as f: f.write(c1)

# 2. SurplusClientTable.tsx
p2 = os.path.join(base, r"components\surplus\SurplusClientTable.tsx")
with open(p2, "r", encoding="utf-8") as f: c2 = f.read()

c2 = c2.replace(
    "function formatEur(n: number): string {\n  return format.number(n, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });\n}",
    "function formatEur(n: number): string {\n  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);\n}"
)
c2 = c2.replace(
    "{ label: 'CO₂ Savings', value: `${format.number(co2Savings, { maximumFractionDigits: 1 })} kg` }",
    "{ label: 'CO₂ Savings', value: `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(co2Savings)} kg` }"
)
with open(p2, "w", encoding="utf-8") as f: f.write(c2)

# 3. offers.ts
p3 = os.path.join(base, r"lib\actions\offers.ts")
with open(p3, "r", encoding="utf-8") as f: c3 = f.read()
c3 = c3.replace("catch (error: Error)", "catch (error: any)")
with open(p3, "w", encoding="utf-8") as f: f.write(c3)

print("TS fixed.")
