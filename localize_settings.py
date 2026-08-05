import os
import json

settings_json_path = os.path.join("messages", "en", "settings.json")

with open(settings_json_path, "r", encoding="utf-8") as f:
    settings_data = json.load(f)

settings_data["page"]["header"] = {
  "title": "Settings",
  "subtitle": "Manage your business profile, notifications and forecast preferences."
}
settings_data["page"]["profile"].update({
  "title": "Business Profile",
  "desc": "Your public business information visible to buyers.",
  "btnEdit": "Edit Profile",
  "btnCancel": "Cancel",
  "notSet": "Not set",
  "success": "Profile saved successfully."
})
settings_data["page"]["notifications"] = {
  "title": "Notifications",
  "on": "ON",
  "off": "OFF",
  "highRiskAlerts": "Email alerts for high-risk surplus items",
  "weeklySummary": "Weekly impact summary email",
  "buyerResponses": "New buyer response notifications",
  "leaderboardUpdates": "Leaderboard ranking updates",
  "competitionReminders": "Monthly competition reminders"
}
settings_data["page"]["forecastSettings"] = {
  "title": "Forecast Settings",
  "periodLabel": "Forecast Period",
  "riskLabel": "High Risk Threshold",
  "riskDesc1": "Products with surplus risk above ",
  "riskDesc2": "% will be flagged as ",
  "riskDesc3": "HIGH",
  "currencyLabel": "Currency"
}
settings_data["page"]["danger"] = {
  "title": "Danger Zone",
  "desc": "These actions are permanent and cannot be undone.",
  "btnDeleteData": "Delete All Uploaded Data",
  "btnDeleteAccount": "Delete Account",
  "confirmDelete": "Are you sure you want to delete all uploaded data? This cannot be undone."
}
settings_data["page"]["fields"] = {
  "full_name": "Full Name",
  "business_name": "Business Name",
  "business_type": "Business Type",
  "city": "City",
  "country": "Country",
  "email": "Contact Email"
}

with open(settings_json_path, "w", encoding="utf-8") as f:
    json.dump(settings_data, f, indent=2, ensure_ascii=False)

settings_page_path = os.path.join("app", "[locale]", "(dashboard)", "settings", "page.tsx")
with open(settings_page_path, "r", encoding="utf-8") as f:
    settings_content = f.read()

replacements = [
    ("import { createClient } from '@/lib/supabase/client';", "import { createClient } from '@/lib/supabase/client';\nimport { useTranslations } from 'next-intl';"),
    ("export default function SettingsPage() {", "export default function SettingsPage() {\n  const t = useTranslations('settings.page');"),
    (">Settings<", ">{t('header.title')}<"),
    (">Manage your business profile, notifications and forecast preferences.<", ">{t('header.subtitle')}<"),
    ("title=\"Business Profile\"", "title={t('profile.title')}"),
    (">Your public business information visible to buyers.<", ">{t('profile.desc')}<"),
    (">Edit Profile<", ">{t('profile.btnEdit')}<"),
    (">Cancel<", ">{t('profile.btnCancel')}<"),
    ("{saving ? 'Saving…' : 'Save Changes'}", "{saving ? t('profile.btnSaving') : t('profile.btnSave')}"),
    ("'Profile saved successfully.'", "t('profile.success')"),
    (">Not set<", ">{t('profile.notSet')}<"),
    ("title=\"Notifications\"", "title={t('notifications.title')}"),
    ("{toggles[key] ? 'ON' : 'OFF'}", "{toggles[key] ? t('notifications.on') : t('notifications.off')}"),
    ("title=\"Forecast Settings\"", "title={t('forecastSettings.title')}"),
    (">Forecast Period<", ">{t('forecastSettings.periodLabel')}<"),
    (">High Risk Threshold<", ">{t('forecastSettings.riskLabel')}<"),
    (">Products with surplus risk above{' '}<", ">{t('forecastSettings.riskDesc1')}<"),
    (">% will be flagged as{' '}<", ">{t('forecastSettings.riskDesc2')}<"),
    (">HIGH<", ">{t('forecastSettings.riskDesc3')}<"),
    (">Currency<", ">{t('forecastSettings.currencyLabel')}<"),
    (">Danger Zone<", ">{t('danger.title')}<"),
    (">These actions are permanent and cannot be undone.<", ">{t('danger.desc')}<"),
    (">Delete All Uploaded Data<", ">{t('danger.btnDeleteData')}<"),
    (">Delete Account<", ">{t('danger.btnDeleteAccount')}<"),
    ("window.confirm('Are you sure you want to delete all uploaded data? This cannot be undone.')", "window.confirm(t('danger.confirmDelete'))"),
    ("{ label: 'Full Name',      key: 'full_name'     }", "{ label: t('fields.full_name'),      key: 'full_name'     }"),
    ("{ label: 'Business Name',  key: 'business_name' }", "{ label: t('fields.business_name'),  key: 'business_name' }"),
    ("{ label: 'Business Type',  key: 'business_type' }", "{ label: t('fields.business_type'),  key: 'business_type' }"),
    ("{ label: 'City',           key: 'city'          }", "{ label: t('fields.city'),           key: 'city'          }"),
    ("{ label: 'Country',        key: 'country'       }", "{ label: t('fields.country'),        key: 'country'       }"),
    ("{ label: 'Contact Email',  key: 'email',  type: 'email' }", "{ label: t('fields.email'),  key: 'email',  type: 'email' }"),
    ("{ key: 'highRiskAlerts',       label: 'Email alerts for high-risk surplus items' }", "{ key: 'highRiskAlerts',       label: t('notifications.highRiskAlerts') }"),
    ("{ key: 'weeklySummary',        label: 'Weekly impact summary email'               }", "{ key: 'weeklySummary',        label: t('notifications.weeklySummary') }"),
    ("{ key: 'buyerResponses',       label: 'New buyer response notifications'          }", "{ key: 'buyerResponses',       label: t('notifications.buyerResponses') }"),
    ("{ key: 'leaderboardUpdates',   label: 'Leaderboard ranking updates'              }", "{ key: 'leaderboardUpdates',   label: t('notifications.leaderboardUpdates') }"),
    ("{ key: 'competitionReminders', label: 'Monthly competition reminders'            }", "{ key: 'competitionReminders', label: t('notifications.competitionReminders') }")
]

# Wait, PROFILE_FIELDS and TOGGLE_ITEMS are outside the component, we need to move them inside or map them inside.
# I'll just change the string interpolation in the render logic instead.

settings_content = settings_content.replace(
    "{label}", "{t(`fields.${key as string}`)}"
)
settings_content = settings_content.replace(
    "{label}</span>", "{t(`notifications.${key}`)}</span>"
)
for old, new in replacements:
    settings_content = settings_content.replace(old, new)

with open(settings_page_path, "w", encoding="utf-8") as f:
    f.write(settings_content)

print("Settings localized.")
