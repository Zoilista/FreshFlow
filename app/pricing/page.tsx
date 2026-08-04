import type { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'Pricing — FreshFlow',
  description:
    'Simple, transparent pricing for FreshFlow. Start free, scale as you grow. No hidden fees. Regional pricing for Europe.',
};

export default function PricingPage() {
  return <PricingClient />;
}
