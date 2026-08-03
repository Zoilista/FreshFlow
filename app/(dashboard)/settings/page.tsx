'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileFormData {
  full_name:     string;
  business_name: string;
  business_type: string;
  city:          string;
  country:       string;
  email:         string;
}

const EMPTY_FORM: ProfileFormData = {
  full_name:     '',
  business_name: '',
  business_type: 'Independent Retailer',
  city:          '',
  country:       '',
  email:         '',
};

interface ProfileField {
  label: string;
  key:   keyof ProfileFormData;
  type?: string;
}

const PROFILE_FIELDS: ProfileField[] = [
  { label: 'Full Name',      key: 'full_name'     },
  { label: 'Business Name',  key: 'business_name' },
  { label: 'Business Type',  key: 'business_type' },
  { label: 'City',           key: 'city'          },
  { label: 'Country',        key: 'country'       },
  { label: 'Contact Email',  key: 'email',  type: 'email' },
];

type ToggleKey =
  | 'highRiskAlerts'
  | 'weeklySummary'
  | 'buyerResponses'
  | 'leaderboardUpdates'
  | 'competitionReminders';

type Currency       = 'EUR' | 'GBP' | 'USD';
type ForecastPeriod = '1 day' | '3 days' | '7 days' | '14 days';

const TOGGLE_ITEMS: { key: ToggleKey; label: string }[] = [
  { key: 'highRiskAlerts',       label: 'Email alerts for high-risk surplus items' },
  { key: 'weeklySummary',        label: 'Weekly impact summary email'               },
  { key: 'buyerResponses',       label: 'New buyer response notifications'          },
  { key: 'leaderboardUpdates',   label: 'Leaderboard ranking updates'              },
  { key: 'competitionReminders', label: 'Monthly competition reminders'            },
];

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
        enabled ? 'bg-primary' : 'bg-gray-200'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200',
          enabled ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-white border border-gray-100 rounded-xl shadow-sm p-6', className)}>
      <h3 className="text-base font-semibold text-gray-800 mb-5">{title}</h3>
      {children}
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonField() {
  return (
    <div>
      <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mb-1.5" />
      <div className="h-10 w-full bg-gray-100 animate-pulse rounded-lg" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, profile, loading } = useUser();
  const supabase = createClient();

  // ── Business Profile ──────────────────────────────────────────────────────
  const [editMode,  setEditMode]  = useState(false);
  const [formData,  setFormData]  = useState<ProfileFormData>(EMPTY_FORM);
  const [draft,     setDraft]     = useState<ProfileFormData>(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleEditStart = () => { setDraft(formData); setEditMode(true); setSaveMsg(null); };
  const handleCancel    = () => { setDraft(formData); setEditMode(false); setSaveMsg(null); };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMsg(null);

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...draft }, { onConflict: 'id' });

    if (error) {
      setSaveMsg({ type: 'error', text: error.message });
    } else {
      setFormData(draft);
      setEditMode(false);
      setSaveMsg({ type: 'success', text: 'Profile saved successfully.' });
      setTimeout(() => setSaveMsg(null), 3000);
    }
    setSaving(false);
  };

  // ── Notifications ─────────────────────────────────────────────────────────
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    highRiskAlerts:       true,
    weeklySummary:        true,
    buyerResponses:       true,
    leaderboardUpdates:   false,
    competitionReminders: true,
  });
  const flipToggle = (key: ToggleKey) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Forecast Settings ─────────────────────────────────────────────────────
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('7 days');
  const [riskThreshold,  setRiskThreshold]  = useState(75);
  const [currency,       setCurrency]       = useState<Currency>('EUR');

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your business profile, notifications and forecast preferences.
        </p>
      </div>

      {/* ── 1. Business Profile ───────────────────────────────────────────── */}
      <Section title="Business Profile">
        <div className="flex items-start justify-between gap-4 mb-5">
          <p className="text-sm text-gray-500">Your public business information visible to buyers.</p>
          {!editMode ? (
            <button
              onClick={handleEditStart}
              disabled={loading}
              className="flex-shrink-0 px-4 py-1.5 text-sm font-semibold border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-1.5 text-sm font-semibold border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Save message */}
        {saveMsg && (
          <div
            className={cn(
              'text-sm p-3 rounded-lg mb-4 border',
              saveMsg.type === 'success'
                ? 'text-green-700 bg-green-50 border-green-200'
                : 'text-red-600 bg-red-50 border-red-200'
            )}
          >
            {saveMsg.text}
          </div>
        )}

        <div className="space-y-4">
          {loading
            ? PROFILE_FIELDS.map((f) => <SkeletonField key={f.key} />)
            : PROFILE_FIELDS.map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                  {editMode ? (
                    <input
                      type={type ?? 'text'}
                      value={draft[key]}
                      onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded-lg px-4 py-2.5">
                      {formData[key] || <span className="text-gray-400 italic">Not set</span>}
                    </p>
                  )}
                </div>
              ))}
        </div>
      </Section>

      {/* ── 2. Notifications ──────────────────────────────────────────────── */}
      <Section title="Notifications">
        <div className="space-y-4">
          {TOGGLE_ITEMS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-700">{label}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cn('text-xs font-semibold', toggles[key] ? 'text-primary' : 'text-gray-400')}>
                  {toggles[key] ? 'ON' : 'OFF'}
                </span>
                <Toggle enabled={toggles[key]} onChange={() => flipToggle(key)} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. Forecast Settings ──────────────────────────────────────────── */}
      <Section title="Forecast Settings">
        <div className="space-y-6">

          {/* Forecast Period */}
          <div>
            <label htmlFor="forecast-period" className="block text-xs font-semibold text-gray-500 mb-1.5">
              Forecast Period
            </label>
            <select
              id="forecast-period"
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(e.target.value as ForecastPeriod)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              {(['1 day', '3 days', '7 days', '14 days'] as ForecastPeriod[]).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Risk Threshold */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="risk-threshold" className="text-xs font-semibold text-gray-500">
                High Risk Threshold
              </label>
              <span className="text-sm font-bold text-primary-dark">{riskThreshold}%</span>
            </div>
            <input
              id="risk-threshold"
              type="range"
              min={50}
              max={90}
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>50%</span><span>90%</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Products with surplus risk above{' '}
              <span className="font-semibold text-gray-700">{riskThreshold}%</span> will be flagged as{' '}
              <span className="font-semibold text-red-600">HIGH</span>.
            </p>
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-xs font-semibold text-gray-500 mb-1.5">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              {(['EUR', 'GBP', 'USD'] as Currency[]).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* ── 4. Danger Zone ────────────────────────────────────────────────── */}
      <div className="border border-red-200 rounded-xl p-6 bg-red-50">
        <h3 className="text-base font-semibold text-red-700 mb-1">Danger Zone</h3>
        <p className="text-xs text-red-500 mb-5">These actions are permanent and cannot be undone.</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all uploaded data? This cannot be undone.')) {
                console.log('Delete all uploaded data');
              }
            }}
            className="flex-1 px-4 py-2.5 text-sm font-semibold border border-red-400 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-150"
          >
            Delete All Uploaded Data
          </button>
          <button
            onClick={() => console.log('Delete account')}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150"
          >
            Delete Account
          </button>
        </div>
      </div>

    </div>
  );
}