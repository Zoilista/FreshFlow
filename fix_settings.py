import os

settings_page_path = os.path.join("app", "[locale]", "(dashboard)", "settings", "page.tsx")
with open(settings_page_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find and replace PROFILE_FIELDS and TOGGLE_ITEMS definitions
profile_fields_def = """const PROFILE_FIELDS: ProfileField[] = [
  { label: t('fields.full_name'),      key: 'full_name'     },
  { label: t('fields.business_name'),  key: 'business_name' },
  { label: t('fields.business_type'),  key: 'business_type' },
  { label: t('fields.city'),           key: 'city'          },
  { label: t('fields.country'),        key: 'country'       },
  { label: t('fields.email'),  key: 'email',  type: 'email' },
];"""

toggle_items_def = """const TOGGLE_ITEMS: { key: ToggleKey; label: string }[] = [
  { key: 'highRiskAlerts',       label: t('notifications.highRiskAlerts') },
  { key: 'weeklySummary',        label: t('notifications.weeklySummary') },
  { key: 'buyerResponses',       label: t('notifications.buyerResponses') },
  { key: 'leaderboardUpdates',   label: t('notifications.leaderboardUpdates') },
  { key: 'competitionReminders', label: t('notifications.competitionReminders') },
];"""

# Remove them from global scope
content = content.replace(profile_fields_def, "")
content = content.replace(toggle_items_def, "")

# Add them inside SettingsPage
insert_pos = content.find("export default function SettingsPage() {\n  const t = useTranslations('settings.page');\n")
if insert_pos != -1:
    insert_str = "export default function SettingsPage() {\n  const t = useTranslations('settings.page');\n\n  " + profile_fields_def.replace("\n", "\n  ") + "\n\n  " + toggle_items_def.replace("\n", "\n  ") + "\n"
    content = content.replace("export default function SettingsPage() {\n  const t = useTranslations('settings.page');\n", insert_str)

with open(settings_page_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed settings page.")
