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

settings_effect = """
  // Profil yüklenince formu doldur
  useEffect(() => {
    if (profile) {
      const mapped: ProfileFormData = {
        full_name:     profile.full_name     ?? '',
        business_name: profile.business_name ?? '',
        business_type: profile.business_type ?? 'Independent Retailer',
        city:          profile.city          ?? '',
        country:       profile.country       ?? '',
        email:         profile.email         ?? user?.email ?? '',
      };
      
      setFormData(mapped);
      
      setDraft(mapped);
    } else if (!loading && user) {
      // Profil yok, e-mail'i doldur
      setFormData((prev) => ({ ...prev, email: user.email ?? '' }));
      setDraft   ((prev) => ({ ...prev, email: user.email ?? '' }));
    }
  }, [profile, loading, user]);
"""

settings_derive = """
  // Deriving state from props during render (React recommended way)
  const [prevProfile, setPrevProfile] = useState<unknown>(null);
  const [prevLoading, setPrevLoading] = useState<boolean>(true);

  if (profile !== prevProfile) {
    setPrevProfile(profile);
    if (profile) {
      const mapped: ProfileFormData = {
        full_name:     (profile as any).full_name     ?? '',
        business_name: (profile as any).business_name ?? '',
        business_type: (profile as any).business_type ?? 'Independent Retailer',
        city:          (profile as any).city          ?? '',
        country:       (profile as any).country       ?? '',
        email:         (profile as any).email         ?? user?.email ?? '',
      };
      setFormData(mapped);
      setDraft(mapped);
    }
  }

  if (loading !== prevLoading) {
    setPrevLoading(loading);
    if (!loading && !profile && user) {
      setFormData((prev) => ({ ...prev, email: user.email ?? '' }));
      setDraft   ((prev) => ({ ...prev, email: user.email ?? '' }));
    }
  }
"""

patch_file(r"app\[locale]\(dashboard)\settings\page.tsx", [
    (settings_effect.strip(), settings_derive.strip()),
    ("const [prevProfile, setPrevProfile] = useState<unknown>(null);", "const [prevProfile, setPrevProfile] = useState<unknown>(undefined);"),
    ("(profile as any)", "(profile as Record<string, unknown>)") # to avoid `any`
])

# Remove unused `label` from settings page line 253
patch_file(r"app\[locale]\(dashboard)\settings\page.tsx", [
    ("{ label, key, type }", "{ key, type }"),
    ("{ label, key, required }", "{ key, required }")
])

patch_file(r"app\[locale]\(dashboard)\dashboard\page.tsx", [
    ("t: any", "t: (k: string, v?: Record<string, unknown>) => string")
])

patch_file(r"components\surplus\SurplusClientTable.tsx", [
    ("t: any", "t: (k: string, v?: Record<string, unknown>) => string")
])

patch_file(r"i18n\request.ts", [
    ("error: any", "error: unknown"),
    ("fallbackErr: any", "fallbackErr: unknown")
])

patch_file(r"lib\actions\offers.ts", [
    ("error: any", "error: unknown")
])

print("Patch 2 created.")
