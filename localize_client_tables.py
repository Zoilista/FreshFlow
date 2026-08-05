import os

# 1. Update SurplusClientTable
surplus_client_path = os.path.join("components", "surplus", "SurplusClientTable.tsx")
with open(surplus_client_path, "r", encoding="utf-8") as f:
    surplus_content = f.read()

# Replace imports and add useTranslations
surplus_content = surplus_content.replace(
    "import { SurplusPredictionRow } from '@/types/database';",
    "import { SurplusPredictionRow } from '@/types/database';\nimport { useTranslations, useFormatter } from 'next-intl';"
)

surplus_content = surplus_content.replace(
    "export default function SurplusClientTable({ initialData }: { initialData: SurplusPredictionRow[] }) {",
    "export default function SurplusClientTable({ initialData }: { initialData: SurplusPredictionRow[] }) {\n  const t = useTranslations('surplus.table');\n  const format = useFormatter();"
)

# We can replace static strings with t('...')
replacements_surplus = [
    ('"Search products..."', 't("searchPlaceholder")'),
    ('"All"', 't("all")'),
    ('"High Risk"', 't("highRisk")'),
    ('"Medium Risk"', 't("mediumRisk")'),
    ('"Low Risk"', 't("lowRisk")'),
    ('<th>Product</th>', '<th>{t("colProduct")}</th>'),
    ('<th>Surplus Qty</th>', '<th>{t("colSurplus")}</th>'),
    ('<th>Risk Level</th>', '<th>{t("colRisk")}</th>'),
    ('<th>Est. Loss</th>', '<th>{t("colEstLoss")}</th>'),
    ('<th>Confidence</th>', '<th>{t("colConfidence")}</th>'),
    ('<th>Action</th>', '<th>{t("colAction")}</th>'),
    ('Create Offer', '{t("btnCreate")}'),
    ('No surplus predictions yet.', '{t("empty")}'),
    ('Upload your latest inventory data to see predictions.', '{t("emptyDesc")}'),
    ('Upload Data', '{t("btnUpload")}'),
    ('item.risk_level === \'CRITICAL\' ? \'CRITICAL\' :', "item.risk_level === 'CRITICAL' ? t('riskCritical') :"),
    ('item.risk_level === \'HIGH\' ? \'HIGH\' :', "item.risk_level === 'HIGH' ? t('riskHigh') :"),
    ('item.risk_level === \'MEDIUM\' ? \'MEDIUM\' :', "item.risk_level === 'MEDIUM' ? t('riskMedium') :"),
    ('\'LOW\'', "t('riskLow')"),
    ('€${item.potential_loss_eur}', '{format.number(item.potential_loss_eur, {style: "currency", currency: "EUR", minimumFractionDigits: 0})}'),
    ('{item.confidence}%', '{format.number(item.confidence / 100, {style: "percent", maximumFractionDigits: 0})}')
]

for old, new in replacements_surplus:
    surplus_content = surplus_content.replace(old, new)

with open(surplus_client_path, "w", encoding="utf-8") as f:
    f.write(surplus_content)


# 2. Update OffersClientTable
offers_client_path = os.path.join("components", "offers", "OffersClientTable.tsx")
with open(offers_client_path, "r", encoding="utf-8") as f:
    offers_content = f.read()

offers_content = offers_content.replace(
    "import { OfferRow } from '@/types/database';",
    "import { OfferRow } from '@/types/database';\nimport { useTranslations, useFormatter } from 'next-intl';"
)

offers_content = offers_content.replace(
    "export default function OffersClientTable({ initialData }: { initialData: OfferRow[] }) {",
    "export default function OffersClientTable({ initialData }: { initialData: OfferRow[] }) {\n  const t = useTranslations('offers.table');\n  const format = useFormatter();"
)

replacements_offers = [
    ('"Search offers..."', 't("searchPlaceholder")'),
    ('"Active"', 't("statusActive")'),
    ('"Pending"', 't("statusPending")'),
    ('"Closed"', 't("statusClosed")'),
    ('<th>Product</th>', '<th>{t("colProduct")}</th>'),
    ('<th>Offer Price</th>', '<th>{t("colPrice")}</th>'),
    ('<th>Quantity</th>', '<th>{t("colQty")}</th>'),
    ('<th>Status</th>', '<th>{t("colStatus")}</th>'),
    ('<th>Expires In</th>', '<th>{t("colExpires")}</th>'),
    ('<th>Action</th>', '<th>{t("colAction")}</th>'),
    ('View Details', '{t("btnView")}'),
    ('No active offers yet.', '{t("empty")}'),
    ('Create offers from your surplus inventory to recover value.', '{t("emptyDesc")}'),
    ('View Surplus', '{t("btnSurplus")}'),
    ('€${offer.offer_price}', '{format.number(offer.offer_price, {style: "currency", currency: "EUR"})}'),
    ('{offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}', '{t("status" + offer.status.charAt(0).toUpperCase() + offer.status.slice(1))}'),
    ('{daysLeft} days', '{format.number(daysLeft)} {daysLeft === 1 ? "day" : "days"}')
]

for old, new in replacements_offers:
    offers_content = offers_content.replace(old, new)

with open(offers_client_path, "w", encoding="utf-8") as f:
    f.write(offers_content)

print("Client tables localized.")
