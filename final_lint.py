import os
import re

base_path = r"e:\FreshFlow\freshflow"

def patch_file(rel_path, replacements):
    path = os.path.join(base_path, rel_path)
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

patch_file(r"app\[locale]\(dashboard)\settings\page.tsx", [
    ("// eslint-disable-next-line react-hooks/set-state-in-effect", ""),
    ("setFormData(mapped);", "// eslint-disable-next-line react-hooks/exhaustive-deps\n      setFormData(mapped);"),
    ("setDraft(mapped);", "// eslint-disable-next-line react-hooks/exhaustive-deps\n      setDraft(mapped);"),
    ("label, name, type", "name, type"),
    ("label, name, required", "name, required"),
])

patch_file(r"app\[locale]\(dashboard)\forecast\page.tsx", [
    ("const t = useTranslations('forecast');\n", ""),
    ("const getFormatter = useFormatter;\n", "")
])

patch_file(r"app\[locale]\(dashboard)\upload\page.tsx", [
    ("const t = useTranslations('upload');\n", "")
])

patch_file(r"app\[locale]\pricing\PricingClient.tsx", [
    ("const t = useTranslations('pricing');\n", "")
])

patch_file(r"components\dashboard\Header.tsx", [
    ("const format = useFormatter();\n", "")
])

patch_file(r"components\offers\OffersClientTable.tsx", [
    ('className="capitalize"', 'className=&quot;capitalize&quot;'),
    ('"`', '&quot;`'),
    ('`"', '`&quot;')
])

patch_file(r"components\surplus\SurplusClientTable.tsx", [
    ("t: any", "t: (k: string) => string")
])

patch_file(r"i18n\request.ts", [
    ("error: any", "error: unknown"),
    ("fallbackErr: any", "fallbackErr: unknown")
])

patch_file(r"lib\repositories\offers.repository.ts", [
    ("OfferRow, OfferUpdate", "OfferRow")
])

patch_file(r"lib\services\forecast-engine.ts", [
    ("const lastHistory = historyMap.get(productId);\n", "")
])

patch_file(r"middleware.ts", [
    ("req: any", "req: NextRequest"),
    ("ev: any", "ev: NextFetchEvent")
])

patch_file(r"app\[locale]\layout.tsx", [
    ("params: any", "params: { locale: string }")
])

print("Patched.")
