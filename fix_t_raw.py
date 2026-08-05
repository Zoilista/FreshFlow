import os

dashboard_page_path = os.path.join("app", "[locale]", "(dashboard)", "dashboard", "page.tsx")
with open(dashboard_page_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "dangerouslySetInnerHTML={{ __html: t.raw('recent.upload', { file: latestUpload.filename }) }} />",
    ">{t.rich('recent.upload', { file: latestUpload.filename, strong: (chunks) => <strong>{chunks}</strong> })}</p>"
)

content = content.replace(
    "dangerouslySetInnerHTML={{ __html: t.raw('recent.highRisk', { count: highRiskCount }) }} />",
    ">{t.rich('recent.highRisk', { count: highRiskCount, strong: (chunks) => <strong>{chunks}</strong> })}</p>"
)

content = content.replace(
    "dangerouslySetInnerHTML={{ __html: t.raw('recent.impact', { value: formatKg(wasteKg) }) }} />",
    ">{t.rich('recent.impact', { value: formatKg(wasteKg), strong: (chunks) => <strong>{chunks}</strong> })}</p>"
)

with open(dashboard_page_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed t.raw to t.rich")
