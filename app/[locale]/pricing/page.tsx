import type { Metadata } from 'next';
import PricingClient from './PricingClient';

import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'pricing.page'});
  return {
    title: `${t('title')} — FreshFlow`,
    description: t('subtitle'),
  };
}

export default function PricingPage() {
  return <PricingClient />;
}
