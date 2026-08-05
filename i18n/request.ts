import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

const namespaces = [
  'common',
  'dashboard',
  'auth',
  'surplus',
  'offers',
  'impact',
  'upload',
  'settings',
  'forecast',
  'pricing',
  'landing'
];

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const messages: Record<string, unknown> = {};

  for (const ns of namespaces) {
    try {
      messages[ns] = (await import(`../messages/${locale}/${ns}.json`)).default;
    } catch {
      // Fallback to English for missing namespaces
      try {
        messages[ns] = (await import(`../messages/en/${ns}.json`)).default;
      } catch {
        messages[ns] = {};
      }
    }
  }

  return {
    locale,
    messages,
    getMessageFallback: ({ key }) => {
      // Return the key itself as a fallback if not found, 
      // or you can implement logic to load the English key here.
      // Next-intl automatically falls back to the default locale if configured in messages.
      return key;
    }
  };
});
