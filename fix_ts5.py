import os

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

# 1. dashboard/page.tsx
patch_file(r"app\[locale]\(dashboard)\dashboard\page.tsx", [
    ("t: (k: string, v?: Record<string, unknown>) => string", "t: (k: string, v?: Record<string, string | number | Date>) => string")
])

# 2. settings/page.tsx
patch_file(r"app\[locale]\(dashboard)\settings\page.tsx", [
    ("(profile as Record<string, unknown>).full_name", "profile.full_name"),
    ("(profile as Record<string, unknown>).business_name", "profile.business_name"),
    ("(profile as Record<string, unknown>).business_type", "profile.business_type"),
    ("(profile as Record<string, unknown>).city", "profile.city"),
    ("(profile as Record<string, unknown>).country", "profile.country"),
    ("(profile as Record<string, unknown>).email", "profile.email")
])

# 3. request.ts
patch_file(r"i18n\request.ts", [
    ("includes(locale as string)", "includes(locale as (typeof routing.locales)[number])")
])

# 4. SurplusClientTable.tsx
patch_file(r"components\surplus\SurplusClientTable.tsx", [
    ("t: (k: string, v?: Record<string, unknown>) => string", "t: (k: string, v?: Record<string, string | number | Date>) => string")
])

print("TS Patches applied.")
