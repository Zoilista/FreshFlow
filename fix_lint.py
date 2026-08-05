import os
import re

base_path = r"e:\FreshFlow\freshflow"

def patch_file(rel_path, replacements):
    path = os.path.join(base_path, rel_path)
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Patched: {rel_path}")

# 1. dashboard/page.tsx
patch_file(r"app\[locale]\(dashboard)\dashboard\page.tsx", [
    ("t: any, formatCurrency: any", "t: any, formatCurrency: (v: number) => string"),
    ("function EmptyDashboard({ displayName, t }: { displayName: string, t: any })", "function EmptyDashboard({ displayName, t }: { displayName: string, t: any })"), # Not the line 45 one? Wait, let's just use regex for 'any' where it's safe.
])

# 2. forecast/page.tsx
patch_file(r"app\[locale]\(dashboard)\forecast\page.tsx", [
    ("import type { SurplusPredictionRow } from '@/types/database';", "import type { Database } from '@/types/supabase';"),
    ("const t = await getTranslations('forecast');", ""),
    ("const format = await getFormatter();", "")
])

# 3. impact/page.tsx
patch_file(r"app\[locale]\(dashboard)\impact\page.tsx", [
    ("const format = await getFormatter();", ""),
    ("t: any", "t: any") # Need to see line 44
])

# 4. upload/UploadPageClient.tsx
patch_file(r"app\[locale]\(dashboard)\upload\UploadPageClient.tsx", [
    ("import { useTranslations } from 'next-intl';", "")
])

# 5. upload/page.tsx
patch_file(r"app\[locale]\(dashboard)\upload\page.tsx", [
    ("const t = await getTranslations('upload');", "")
])

# 6. layout.tsx
patch_file(r"app\[locale]\layout.tsx", [
    ("params: any", "params: { locale: string }")
])

# 7. page.tsx
patch_file(r"app\[locale]\page.tsx", [
    ("import LanguageSwitcher from '@/components/LanguageSwitcher';", ""),
    ("It's", "It&apos;s"),
    ("You'll", "You&apos;ll"),
    ("Don't", "Don&apos;t"),
    ("We'll", "We&apos;ll"),
    ("Let's", "Let&apos;s"),
    ("you're", "you&apos;re"),
    ("We've", "We&apos;ve"),
])

# 8. PricingClient.tsx
patch_file(r"app\[locale]\pricing\PricingClient.tsx", [
    ("const t = useTranslations('pricing');", "")
])

# 9. waitlist route.ts
patch_file(r"app\api\waitlist\route.ts", [
    ("const { data, error }", "const { error }")
])

# 10. OffersClientTable.tsx
patch_file(r"components\offers\OffersClientTable.tsx", [
    ('"accepted"', '&quot;accepted&quot;'),
    ('"rejected"', '&quot;rejected&quot;')
])

# 11. SurplusClientTable.tsx
patch_file(r"components\surplus\SurplusClientTable.tsx", [
    ("t: any", "t: any")
])

# 12. i18n/request.ts
patch_file(r"i18n\request.ts", [
    ("e: any", "e: unknown"),
    ("fallbackErr: any", "fallbackErr: unknown"),
    ("catch (e) {", "catch {")
])

# 13. actions/offers.ts
patch_file(r"lib\actions\offers.ts", [
    ("e: any", "e: Error"),
    ("error: any", "error: Error")
])

# 14. offers.repository.ts
patch_file(r"lib\repositories\offers.repository.ts", [
    ("OfferRow, OfferUpdate", "OfferRow")
])

# 15. forecast-engine.ts
patch_file(r"lib\services\forecast-engine.ts", [
    ("const lastHistory = historyMap.get(productId);", "// const lastHistory = historyMap.get(productId);")
])

# 16. middleware.ts
patch_file(r"middleware.ts", [
    ("let response = NextResponse.next({", "const response = NextResponse.next({"),
    ("req: any", "req: NextRequest"),
    ("ev: any", "ev: NextFetchEvent")
])
