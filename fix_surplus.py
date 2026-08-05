import os

surplus_page_path = os.path.join("app", "[locale]", "(dashboard)", "surplus", "page.tsx")
with open(surplus_page_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix import
content = content.replace(
    "import { getSurplusPredictions } from '@/lib/repositories/forecasts.repository';",
    "import { getSurplusPredictions } from '@/lib/repositories/forecasts.repository';\nimport { getLatestUpload } from '@/lib/repositories/uploads.repository';"
)

# Fix predictions fetch
fetch_old = "const predictions = await getSurplusPredictions(user.id);"
fetch_new = """const latestUpload = await getLatestUpload(user.id);
  const predictions = latestUpload ? await getSurplusPredictions(user.id, latestUpload.id) : [];"""
content = content.replace(fetch_old, fetch_new)

# Fix Client Table props
content = content.replace(
    "<SurplusClientTable initialData={predictions} />",
    "<SurplusClientTable predictions={predictions} userId={user.id} />"
)

with open(surplus_page_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed surplus page.")
