import os
import re

base = r"e:\FreshFlow\freshflow"

def patch_file(rel_path, replacements):
    path = os.path.join(base, rel_path)
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    for old, new in replacements:
        if callable(new):
            content = re.sub(old, new, content, flags=re.MULTILINE)
        else:
            content = content.replace(old, new)
        
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# 1. forecast/page.tsx
patch_file(r"app\[locale]\(dashboard)\forecast\page.tsx", [
    ("const t = await getTranslations('forecast.page');", "")
])

# 2. settings/page.tsx
patch_file(r"app\[locale]\(dashboard)\settings\page.tsx", [
    ("import { useState, useEffect }", "import { useState }"),
    ("{TOGGLE_ITEMS.map(({ key, label }) => (", "{TOGGLE_ITEMS.map(({ key }) => (")
])

# 3. upload/page.tsx
patch_file(r"app\[locale]\(dashboard)\upload\page.tsx", [
    ("const t = useTranslations('upload');", "")
])

# 4. page.tsx
# Let's fix line 152 in app\[locale]\page.tsx. I will just replace `It's` with `It&apos;s` using regex to catch it safely.
# Wait, let's just replace all `'` inside text. 
# Or let's check line 152. I can just read it and replace.
def fix_quotes(match):
    return match.group(0).replace("'", "&apos;")
patch_file(r"app\[locale]\page.tsx", [
    (r"(?<=[\w])'(?=[a-zA-Z])", "&apos;")
])

# 5. pricing/PricingClient.tsx
patch_file(r"app\[locale]\pricing\PricingClient.tsx", [
    ("const t = useTranslations('pricing');", "")
])

# 6. Header.tsx
patch_file(r"components\dashboard\Header.tsx", [
    ("const format = useFormatter();", ""),
    ("import { useTranslations, useFormatter } from 'next-intl';", "import { useTranslations } from 'next-intl';")
])

# 7. offers.repository.ts
patch_file(r"lib\repositories\offers.repository.ts", [
    ("OfferRow, OfferUpdate, OfferStatus", "OfferRow, OfferStatus")
])

print("Patches applied.")
