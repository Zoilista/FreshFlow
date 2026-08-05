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

# 1. settings/page.tsx
patch_file(r"app\[locale]\(dashboard)\settings\page.tsx", [
    ("// eslint-disable-next-line react-hooks/exhaustive-deps\n      setFormData(mapped);", "setFormData(mapped);"),
    ("// eslint-disable-next-line react-hooks/exhaustive-deps\n      setDraft(mapped);", "setDraft(mapped);"),
    ("    } else if (!loading && user) {\n      // Profil yok, e-mail'i doldur\n      setFormData((prev) => ({ ...prev, email: user.email ?? '' }));\n      setDraft   ((prev) => ({ ...prev, email: user.email ?? '' }));\n    }\n  }, []);", 
     "    } else if (!loading && user) {\n      // Profil yok, e-mail'i doldur\n      setFormData((prev) => ({ ...prev, email: user.email ?? '' }));\n      setDraft   ((prev) => ({ ...prev, email: user.email ?? '' }));\n    }\n  }, [profile, user, loading]);"),
    ("{ label, key, type }", "{ key, type }"),
    ("{ label, key, required }", "{ key, required }")
])

# 2. forecast/page.tsx
patch_file(r"app\[locale]\(dashboard)\forecast\page.tsx", [
    ("// eslint-disable-next-line @typescript-eslint/no-unused-vars\n  const t = useTranslations('forecast');", "")
])

# 3. upload/page.tsx
patch_file(r"app\[locale]\(dashboard)\upload\page.tsx", [
    ("// eslint-disable-next-line @typescript-eslint/no-unused-vars\n  const t = useTranslations('upload');", "")
])

# 4. page.tsx (home)
patch_file(r"app\[locale]\page.tsx", [
    ("It's", "It&apos;s"),
    ("You'll", "You&apos;ll"),
    ("Don't", "Don&apos;t"),
    ("We'll", "We&apos;ll"),
    ("Let's", "Let&apos;s"),
    ("you're", "you&apos;re"),
    ("We've", "We&apos;ve"),
    ("That's", "That&apos;s"),
    ("isn't", "isn&apos;t"),
    ("aren't", "aren&apos;t"),
    ("they're", "they&apos;re"),
])

# 5. pricing/PricingClient.tsx
patch_file(r"app\[locale]\pricing\PricingClient.tsx", [
    ("// eslint-disable-next-line @typescript-eslint/no-unused-vars\n  const t = useTranslations('pricing');", "")
])

# 6. Header.tsx
patch_file(r"components\dashboard\Header.tsx", [
    ("// eslint-disable-next-line @typescript-eslint/no-unused-vars\n  const format = useFormatter();", "")
])

# 7. OffersClientTable.tsx
patch_file(r"components\offers\OffersClientTable.tsx", [
    ('className="capitalize" // eslint-disable-line react/no-unescaped-entities', 'className=&quot;capitalize&quot;'),
    ('"`', '&quot;`'),
    ('`"', '`&quot;')
])

# 8. request.ts
patch_file(r"i18n\request.ts", [
    ("// eslint-disable-next-line @typescript-eslint/no-unused-vars\n      fallbackErr: unknown", "fallbackErr: unknown"),
    ("// eslint-disable-next-line @typescript-eslint/no-unused-vars\n    } catch (e: unknown)", "} catch (e: unknown)"),
    ("// eslint-disable-next-line @typescript-eslint/no-unused-vars\n  } catch (error: unknown)", "} catch (error: unknown)"),
    ("// eslint-disable-next-line @typescript-eslint/no-unused-vars\n  const namespace =", "const namespace =")
])
patch_file(r"i18n\request.ts", [
    ("} catch (error: unknown) {", "} catch {"),
    ("} catch (e: unknown) {", "} catch {")
])
patch_file(r"i18n\request.ts", [
    ("catch {", "catch (error: unknown) {")
])
# Let's completely rewrite the catch blocks in request.ts to avoid unused variables
patch_file(r"i18n\request.ts", [
    ("catch (error: unknown) {\n    if (error instanceof Error)", "catch (error: unknown) {\n    void error;\n    if (error instanceof Error)"),
    ("catch (e: unknown) {\n      if (e instanceof Error)", "catch (e: unknown) {\n      void e;\n      if (e instanceof Error)"),
    ("catch (fallbackErr: unknown) {\n        console.error", "catch (fallbackErr: unknown) {\n        void fallbackErr;\n        console.error")
])

# 9. offers.ts
patch_file(r"lib\actions\offers.ts", [
    ("catch (error: any) {\n    return { success: false, error: error.message };", "catch (error: unknown) {\n    return { success: false, error: error instanceof Error ? error.message : String(error) };")
])

# 10. offers.repository.ts
patch_file(r"lib\repositories\offers.repository.ts", [
    ("OfferRow, OfferUpdate", "OfferRow")
])

print("Patches applied.")
