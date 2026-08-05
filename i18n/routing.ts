import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const locales = ['en', 'tr', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt'] as const;
export const defaultLocale = 'en';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // or 'always'
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
