import os
import json

landing_json_path = os.path.join("messages", "en", "landing.json")
pricing_json_path = os.path.join("messages", "en", "pricing.json")

landing_data = {
  "navbar": {
    "product": "Product",
    "pricing": "Pricing",
    "login": "Log in",
    "getStarted": "Get Started"
  },
  "hero": {
    "badge": "NEW: AI-powered surplus management",
    "title1": "Stop Fresh Food Waste",
    "title2": "Before It Happens",
    "subtitle": "Join hundreds of independent food businesses using AI to accurately forecast demand, prevent over-ordering, and turn surplus inventory into recovered revenue.",
    "cta": "Start Your Free Trial",
    "demo": "Book a Demo"
  },
  "features": {
    "title": "Everything you need to run a zero-waste operation",
    "subtitle": "Purpose-built for independent wholesalers, retailers, and restaurants.",
    "f1Title": "Demand Forecasting",
    "f1Desc": "Upload your sales history and let our AI predict exactly how much fresh food you need for the next 7 days.",
    "f2Title": "Surplus Alerts",
    "f2Desc": "Get notified before items expire. We identify high-risk inventory so you can take action early.",
    "f3Title": "Automated Offers",
    "f3Desc": "Turn surplus into revenue by instantly creating discounted offers for your B2B buyers or local charities."
  },
  "footer": {
    "copyright": "© 2026 FreshFlow. All rights reserved.",
    "terms": "Terms of Service",
    "privacy": "Privacy Policy"
  }
}

pricing_data = {
  "page": {
    "title": "Simple, transparent pricing",
    "subtitle": "Start preventing waste today. No hidden fees, cancel anytime.",
    "monthly": "Monthly",
    "annually": "Annually",
    "save20": "Save 20%",
    "getStarted": "Get Started",
    "contactSales": "Contact Sales",
    "starter": {
      "name": "Starter",
      "desc": "Perfect for single-location restaurants and small retailers.",
      "price": "49",
      "priceAnnual": "39",
      "f1": "Up to 500 products tracked",
      "f2": "Basic demand forecasting",
      "f3": "Email surplus alerts",
      "f4": "Standard support"
    },
    "pro": {
      "name": "Professional",
      "desc": "For busy wholesalers and multi-location businesses.",
      "price": "99",
      "priceAnnual": "79",
      "f1": "Unlimited products tracked",
      "f2": "Advanced AI forecasting",
      "f3": "Automated B2B offers",
      "f4": "Priority support"
    }
  }
}

with open(landing_json_path, "w", encoding="utf-8") as f:
    json.dump(landing_data, f, indent=2, ensure_ascii=False)

with open(pricing_json_path, "w", encoding="utf-8") as f:
    json.dump(pricing_data, f, indent=2, ensure_ascii=False)

# Rewrite Landing Page
landing_path = os.path.join("app", "[locale]", "page.tsx")
with open(landing_path, "r", encoding="utf-8") as f:
    landing_content = f.read()

landing_replacements = [
    ("import { Link } from '@/i18n/routing';", "import { Link } from '@/i18n/routing';\nimport { getTranslations } from 'next-intl/server';\nimport LanguageSwitcher from '@/components/LanguageSwitcher';"),
    ("export default function LandingPage() {", "export default async function LandingPage() {\n  const t = await getTranslations('landing');"),
    (">Product<", ">{t('navbar.product')}<"),
    (">Pricing<", ">{t('navbar.pricing')}<"),
    (">Log in<", ">{t('navbar.login')}<"),
    (">Get Started<", ">{t('navbar.getStarted')}<"),
    ("NEW: AI-powered surplus management", "{t('hero.badge')}"),
    (">Stop Fresh Food Waste<", ">{t('hero.title1')}<"),
    (">Before It Happens<", ">{t('hero.title2')}<"),
    (">Join hundreds of independent food businesses using AI to accurately forecast demand, prevent over-ordering, and turn surplus inventory into recovered revenue.<", ">{t('hero.subtitle')}<"),
    (">Start Your Free Trial<", ">{t('hero.cta')}<"),
    (">Book a Demo<", ">{t('hero.demo')}<"),
    (">Everything you need to run a zero-waste operation<", ">{t('features.title')}<"),
    (">Purpose-built for independent wholesalers, retailers, and restaurants.<", ">{t('features.subtitle')}<"),
    (">Demand Forecasting<", ">{t('features.f1Title')}<"),
    (">Upload your sales history and let our AI predict exactly how much fresh food you need for the next 7 days.<", ">{t('features.f1Desc')}<"),
    (">Surplus Alerts<", ">{t('features.f2Title')}<"),
    (">Get notified before items expire. We identify high-risk inventory so you can take action early.<", ">{t('features.f2Desc')}<"),
    (">Automated Offers<", ">{t('features.f3Title')}<"),
    (">Turn surplus into revenue by instantly creating discounted offers for your B2B buyers or local charities.<", ">{t('features.f3Desc')}<"),
    ("© 2026 FreshFlow. All rights reserved.", "{t('footer.copyright')}"),
    (">Terms of Service<", ">{t('footer.terms')}<"),
    (">Privacy Policy<", ">{t('footer.privacy')}<"),
    ("<div className=\"flex items-center gap-4\">", "<div className=\"flex items-center gap-4\">\n          <LanguageSwitcher />")
]

for old, new in landing_replacements:
    landing_content = landing_content.replace(old, new)
with open(landing_path, "w", encoding="utf-8") as f:
    f.write(landing_content)

# Pricing Client
pricing_client_path = os.path.join("app", "[locale]", "pricing", "PricingClient.tsx")
with open(pricing_client_path, "r", encoding="utf-8") as f:
    pricing_content = f.read()
pricing_replacements = [
    ("import { Link } from '@/i18n/routing';", "import { Link } from '@/i18n/routing';\nimport { useTranslations } from 'next-intl';"),
    ("export default function PricingClient() {", "export default function PricingClient() {\n  const t = useTranslations('pricing.page');"),
    (">Simple, transparent pricing<", ">{t('title')}<"),
    (">Start preventing waste today. No hidden fees, cancel anytime.<", ">{t('subtitle')}<"),
    (">Monthly<", ">{t('monthly')}<"),
    (">Annually<", ">{t('annually')}<"),
    (">Save 20%<", ">{t('save20')}<"),
    (">Starter<", ">{t('starter.name')}<"),
    (">Perfect for single-location restaurants and small retailers.<", ">{t('starter.desc')}<"),
    (">${isAnnual ? '39' : '49'}<", ">${isAnnual ? t('starter.priceAnnual') : t('starter.price')}<"),
    (">Up to 500 products tracked<", ">{t('starter.f1')}<"),
    (">Basic demand forecasting<", ">{t('starter.f2')}<"),
    (">Email surplus alerts<", ">{t('starter.f3')}<"),
    (">Standard support<", ">{t('starter.f4')}<"),
    (">Professional<", ">{t('pro.name')}<"),
    (">For busy wholesalers and multi-location businesses.<", ">{t('pro.desc')}<"),
    (">${isAnnual ? '79' : '99'}<", ">${isAnnual ? t('pro.priceAnnual') : t('pro.price')}<"),
    (">Unlimited products tracked<", ">{t('pro.f1')}<"),
    (">Advanced AI forecasting<", ">{t('pro.f2')}<"),
    (">Automated B2B offers<", ">{t('pro.f3')}<"),
    (">Priority support<", ">{t('pro.f4')}<"),
    (">Get Started<", ">{t('getStarted')}<"),
    (">Contact Sales<", ">{t('contactSales')}<")
]

for old, new in pricing_replacements:
    pricing_content = pricing_content.replace(old, new)

with open(pricing_client_path, "w", encoding="utf-8") as f:
    f.write(pricing_content)

print("Landing and Pricing localized.")
