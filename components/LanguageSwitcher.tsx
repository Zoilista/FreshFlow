'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';
import { locales } from '@/i18n/routing';

export default function LanguageSwitcher({
  mobile = false
}: {
  mobile?: boolean;
}) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const LOCALE_NAMES: Record<string, string> = {
    en: 'English',
    tr: 'Türkçe',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    it: 'Italiano',
    nl: 'Nederlands',
    pl: 'Polski',
    pt: 'Português'
  };

  if (mobile) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('language')}
        </label>
        <select
          value={locale}
          onChange={handleLocaleChange}
          disabled={isPending}
          className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none disabled:opacity-50"
        >
          {locales.map((l) => (
            <option key={l} value={l}>
              {LOCALE_NAMES[l]}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={handleLocaleChange}
        disabled={isPending}
        className={cn(
          "appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg",
          "focus:ring-2 focus:ring-primary/20 focus:border-primary block p-2 pl-3 pr-8 outline-none disabled:opacity-50 cursor-pointer hover:bg-gray-100 transition-colors"
        )}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()} - {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  );
}
