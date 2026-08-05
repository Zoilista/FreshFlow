import os

landing_path = os.path.join("app", "[locale]", "page.tsx")
with open(landing_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace getTranslations with useTranslations
content = content.replace("import { getTranslations } from 'next-intl/server';", "import { useTranslations } from 'next-intl';")

# Add t to HeroSection
content = content.replace("function HeroSection({ onOpenWaitlist }: HeroSectionProps) {\n  return (", "function HeroSection({ onOpenWaitlist }: HeroSectionProps) {\n  const t = useTranslations('landing.page');\n  return (")

# Add t to Footer
content = content.replace("function Footer() {\n  return (", "function Footer() {\n  const t = useTranslations('landing.page');\n  return (")

# Fix LandingPage
content = content.replace("export default async function LandingPage() {\n  const t = await getTranslations('landing');", "export default function LandingPage() {")

with open(landing_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed landing page.")
