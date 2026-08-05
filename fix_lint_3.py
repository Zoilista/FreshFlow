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
        content = content.replace(old, new)
        
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# 1. request.ts
patch_file(r"i18n\request.ts", [
    ("locale as any", "locale as string"),
    ("messages: Record<string, any>", "messages: Record<string, unknown>"),
    ("catch (error: unknown)", "catch"),
    ("catch (fallbackErr)", "catch"),
    ("getMessageFallback: ({namespace, key, error}) => {", "getMessageFallback: ({ key }) => {")
])

# 2. OffersClientTable.tsx
patch_file(r"components\offers\OffersClientTable.tsx", [
    ('"{offer.notes}"', '&quot;{offer.notes}&quot;')
])

# 3. SurplusClientTable.tsx
patch_file(r"components\surplus\SurplusClientTable.tsx", [
    ("catch (err: any)", "catch (err: unknown)"),
    ("alert(`Error creating offer: ${err.message}`)", "alert(`Error creating offer: ${err instanceof Error ? err.message : String(err)}`)")
])

# 4. offers.repository.ts
patch_file(r"lib\repositories\offers.repository.ts", [
    ("import type { OfferInsert, OfferRow, OfferUpdate, OfferStatus }", "import type { OfferInsert, OfferRow, OfferStatus }")
])

print("Patches applied.")
