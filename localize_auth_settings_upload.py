import os
import json

# 1. Update English JSON for Auth, Settings, Upload
auth_json_path = os.path.join("messages", "en", "auth.json")
settings_json_path = os.path.join("messages", "en", "settings.json")
upload_json_path = os.path.join("messages", "en", "upload.json")

auth_data = {
  "login": {
    "title": "Welcome back",
    "subtitle": "Enter your details to access your dashboard.",
    "emailLabel": "Email address",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "••••••••",
    "btnSubmit": "Sign in",
    "btnSubmitting": "Signing in...",
    "noAccount": "Don't have an account?",
    "btnRegister": "Create one",
    "errorGeneric": "An error occurred during sign in"
  },
  "register": {
    "title": "Create an account",
    "subtitle": "Start reducing food waste today.",
    "nameLabel": "Full Name",
    "namePlaceholder": "John Doe",
    "businessLabel": "Business Name",
    "businessPlaceholder": "Fresh Market Inc.",
    "emailLabel": "Email address",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "••••••••",
    "btnSubmit": "Create account",
    "btnSubmitting": "Creating account...",
    "hasAccount": "Already have an account?",
    "btnLogin": "Sign in",
    "errorGeneric": "An error occurred during registration"
  }
}

settings_data = {
  "page": {
    "title": "Settings",
    "subtitle": "Manage your account, preferences, and organization details.",
    "tabs": {
      "profile": "Profile",
      "preferences": "Preferences",
      "billing": "Billing"
    },
    "profile": {
      "title": "Profile Information",
      "desc": "Update your personal and business details.",
      "nameLabel": "Full Name",
      "businessLabel": "Business Name",
      "emailLabel": "Email Address",
      "btnSave": "Save Changes",
      "btnSaving": "Saving...",
      "success": "Profile updated successfully.",
      "error": "Failed to update profile."
    },
    "preferences": {
      "title": "Application Preferences",
      "desc": "Customize your experience.",
      "languageLabel": "Language",
      "currencyLabel": "Currency",
      "btnSave": "Save Preferences"
    }
  }
}

upload_data = {
  "page": {
    "title": "Upload Inventory Data",
    "subtitle": "Upload your latest sales and stock data to generate fresh forecasts.",
    "btnDownloadTemplate": "Download CSV Template",
    "uploadBox": {
      "title": "Click to upload",
      "desc": "or drag and drop",
      "formats": "CSV or Excel (max. 10MB)",
      "uploading": "Uploading & Analyzing...",
      "processing": "Processing data...",
      "success": "Upload successful!"
    },
    "validation": {
      "title": "Data Validation",
      "row": "Row {row}",
      "rowsValid": "{count} rows valid",
      "errorsFound": "{count} errors found",
      "noErrors": "Perfect! Your data is ready to be processed."
    }
  }
}

with open(auth_json_path, "w", encoding="utf-8") as f:
    json.dump(auth_data, f, indent=2, ensure_ascii=False)

with open(settings_json_path, "w", encoding="utf-8") as f:
    json.dump(settings_data, f, indent=2, ensure_ascii=False)

with open(upload_json_path, "w", encoding="utf-8") as f:
    json.dump(upload_data, f, indent=2, ensure_ascii=False)


# 2. Rewrite Auth Pages
login_path = os.path.join("app", "[locale]", "(auth)", "login", "page.tsx")
with open(login_path, "r", encoding="utf-8") as f:
    login_content = f.read()

login_replacements = [
    ("import { useRouter } from '@/i18n/routing'", "import { useRouter } from '@/i18n/routing';\nimport { useTranslations } from 'next-intl';"),
    ("export default function LoginPage() {", "export default function LoginPage() {\n  const t = useTranslations('auth.login');"),
    (">Welcome back<", ">{t('title')}<"),
    (">Enter your details to access your dashboard.<", ">{t('subtitle')}<"),
    (">Email address<", ">{t('emailLabel')}<"),
    ('placeholder="you@example.com"', 'placeholder={t("emailPlaceholder")}'),
    (">Password<", ">{t('passwordLabel')}<"),
    ('placeholder="••••••••"', 'placeholder={t("passwordPlaceholder")}'),
    ("{loading ? 'Signing in...' : 'Sign in'}", "{loading ? t('btnSubmitting') : t('btnSubmit')}"),
    (">Don't have an account?<", ">{t('noAccount')}<"),
    (">Create one<", ">{t('btnRegister')}<"),
    ("setError(err.message)", "setError(t('errorGeneric'))")
]
for old, new in login_replacements:
    login_content = login_content.replace(old, new)
with open(login_path, "w", encoding="utf-8") as f:
    f.write(login_content)

register_path = os.path.join("app", "[locale]", "(auth)", "register", "page.tsx")
with open(register_path, "r", encoding="utf-8") as f:
    register_content = f.read()
register_replacements = [
    ("import { useRouter } from '@/i18n/routing'", "import { useRouter } from '@/i18n/routing';\nimport { useTranslations } from 'next-intl';"),
    ("export default function RegisterPage() {", "export default function RegisterPage() {\n  const t = useTranslations('auth.register');"),
    (">Create an account<", ">{t('title')}<"),
    (">Start reducing food waste today.<", ">{t('subtitle')}<"),
    (">Full Name<", ">{t('nameLabel')}<"),
    ('placeholder="John Doe"', 'placeholder={t("namePlaceholder")}'),
    (">Business Name<", ">{t('businessLabel')}<"),
    ('placeholder="Fresh Market Inc."', 'placeholder={t("businessPlaceholder")}'),
    (">Email address<", ">{t('emailLabel')}<"),
    ('placeholder="you@example.com"', 'placeholder={t("emailPlaceholder")}'),
    (">Password<", ">{t('passwordLabel')}<"),
    ('placeholder="••••••••"', 'placeholder={t("passwordPlaceholder")}'),
    ("{loading ? 'Creating account...' : 'Create account'}", "{loading ? t('btnSubmitting') : t('btnSubmit')}"),
    (">Already have an account?<", ">{t('hasAccount')}<"),
    (">Sign in<", ">{t('btnLogin')}<"),
    ("setError(err.message)", "setError(t('errorGeneric'))")
]
for old, new in register_replacements:
    register_content = register_content.replace(old, new)
with open(register_path, "w", encoding="utf-8") as f:
    f.write(register_content)

# 3. Upload Page
upload_page_path = os.path.join("app", "[locale]", "(dashboard)", "upload", "page.tsx")
with open(upload_page_path, "r", encoding="utf-8") as f:
    upload_content = f.read()
upload_replacements = [
    ("export default async function UploadPage() {", "import { getTranslations } from 'next-intl/server';\n\nexport default async function UploadPage() {\n  const t = await getTranslations('upload.page');"),
    (">Upload Inventory Data<", ">{t('title')}<"),
    (">Upload your latest sales and stock data to generate fresh forecasts.<", ">{t('subtitle')}<")
]
for old, new in upload_replacements:
    upload_content = upload_content.replace(old, new)
with open(upload_page_path, "w", encoding="utf-8") as f:
    f.write(upload_content)

# Upload Client
upload_client_path = os.path.join("app", "[locale]", "(dashboard)", "upload", "UploadPageClient.tsx")
with open(upload_client_path, "r", encoding="utf-8") as f:
    upload_client = f.read()
upload_client_replacements = [
    ("import { useRouter } from '@/i18n/routing';", "import { useRouter } from '@/i18n/routing';\nimport { useTranslations } from 'next-intl';"),
    ("export default function UploadPageClient() {", "export default function UploadPageClient() {\n  const t = useTranslations('upload.page');"),
    ("Download CSV Template", "{t('btnDownloadTemplate')}"),
    ("Click to upload", "{t('uploadBox.title')}"),
    ("or drag and drop", "{t('uploadBox.desc')}"),
    ("CSV or Excel (max. 10MB)", "{t('uploadBox.formats')}"),
    ("Uploading & Analyzing...", "{t('uploadBox.uploading')}"),
    ("Processing data...", "{t('uploadBox.processing')}"),
    ("Upload successful!", "{t('uploadBox.success')}"),
    (">Data Validation<", ">{t('validation.title')}<"),
    ("Row ${err.row}", "{t('validation.row', {row: err.row})}"),
    ("{validRows} rows valid", "{t('validation.rowsValid', {count: validRows})}"),
    ("{errors.length} errors found", "{t('validation.errorsFound', {count: errors.length})}"),
    ("Perfect! Your data is ready to be processed.", "{t('validation.noErrors')}")
]
for old, new in upload_client_replacements:
    upload_client = upload_client.replace(old, new)
with open(upload_client_path, "w", encoding="utf-8") as f:
    f.write(upload_client)

print("Auth, Settings, Upload localized.")
