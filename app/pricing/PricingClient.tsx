'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Region = 'west' | 'south';
type ModalState = 'idle' | 'loading' | 'success' | 'error';

interface Plan {
  id: string;
  name: string;
  tag?: string;
  tagColor?: string;
  description: string;
  priceWest: string | null; // null = Free
  priceSouth: string | null;
  period: string;
  features: string[];
  cta: string;
  ctaVariant: 'primary' | 'outline' | 'secondary';
  ctaAction: 'waitlist' | 'mailto';
  highlighted: boolean;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function LogoIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function CheckIcon({ className = 'h-4 w-4 text-primary' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function XIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── Waitlist Modal ───────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  'Wholesaler',
  'Independent Retailer',
  'Restaurant & Catering',
  'Bakery',
  'Other',
] as const;

interface WaitlistModalProps {
  onClose: () => void;
}

function WaitlistModal({ onClose }: WaitlistModalProps) {
  const [form, setForm] = useState({
    name:          '',
    email:         '',
    business_type: '',
    city:          '',
  });
  const [state, setState] = useState<ModalState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/waitlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data: { success: boolean; message: string } = await res.json();
      if (data.success) {
        setState('success');
      } else {
        setErrorMsg(data.message || 'Something went wrong.');
        setState('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setState('error');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-[slideUp_0.2s_ease]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <XIcon className="h-5 w-5" />
        </button>

        {state === 'success' ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <CheckIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re on the list! ✓</h3>
            <p className="text-gray-500 text-sm mb-6">
              We&apos;ll be in touch soon with your early access invite. Stay fresh 🌱
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Get Early Access 🌱</h3>
              <p className="text-sm text-gray-500">Join 40+ businesses already on the waitlist</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="pm-wl-name" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="pm-wl-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="pm-wl-email" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="pm-wl-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@business.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="pm-wl-business-type" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Business Type
                </label>
                <select
                  id="pm-wl-business-type"
                  name="business_type"
                  value={form.business_type}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                  <option value="">Select type…</option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pm-wl-city" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  id="pm-wl-city"
                  name="city"
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Amsterdam"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              {state === 'error' && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={state === 'loading'}
                className="w-full py-3 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {state === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Joining…
                  </span>
                ) : (
                  'Join Waitlist'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Navbar (mirrors landing page) ───────────────────────────────────────────

function Navbar({ onOpenWaitlist }: { onOpenWaitlist: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <LogoIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">FreshFlow</span>
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          <Link href="/#features" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-150">
            Features
          </Link>
          <Link href="/pricing" className="px-4 py-2 text-sm font-medium text-primary rounded-xl bg-primary-light transition-all duration-150">
            Pricing
          </Link>
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-150">
            Log in
          </Link>
          <button
            onClick={onOpenWaitlist}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            Get Started
          </button>
        </nav>

        <button
          id="pricing-mobile-menu-toggle"
          className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors duration-150"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-2">
          <Link href="/login" className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-150" onClick={() => setOpen(false)}>
            Log in
          </Link>
          <button
            onClick={() => { setOpen(false); onOpenWaitlist(); }}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl text-center shadow-sm transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      )}
    </header>
  );
}

// ─── Footer (mirrors landing page) ───────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <LogoIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight">FreshFlow</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              AI-powered demand forecasting and surplus matching for independent food businesses across Europe. Less waste, more value.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-2.5">
              {['Features', 'How It Works', 'Impact', 'Pricing'].map((link) => (
                <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors duration-150">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              {['About', 'Privacy', 'Contact', 'Blog'].map((link) => (
                <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors duration-150">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2026 FreshFlow. All rights reserved.</p>
          <p className="text-xs text-gray-400">Made with 🌿 for a sustainable Europe</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Plan Data ────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for getting started',
    priceWest: null,
    priceSouth: null,
    period: '',
    features: [
      'Up to 50 products',
      '7-day demand forecast',
      'CSV upload (manual)',
      'Basic surplus alerts',
      'Impact dashboard',
      'Email support',
    ],
    cta: 'Start Free',
    ctaVariant: 'outline',
    ctaAction: 'waitlist',
    highlighted: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    tag: 'Most Popular',
    tagColor: 'bg-primary text-white',
    description: 'For growing independent businesses',
    priceWest: '€49',
    priceSouth: '€29',
    period: '/mo',
    features: [
      'Everything in Starter, plus:',
      'Up to 500 products',
      '14-day demand forecast',
      'Surplus marketplace access',
      'City leaderboard & competitions',
      'Priority email support',
      'Basic API access',
    ],
    cta: 'Get Started',
    ctaVariant: 'primary',
    ctaAction: 'waitlist',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For multi-location operators',
    priceWest: '€149',
    priceSouth: '€89',
    period: '/mo',
    features: [
      'Everything in Growth, plus:',
      'Unlimited products',
      '30-day forecast + seasonal analysis',
      'Full marketplace + buyer network',
      'Custom impact reports (ESG)',
      'Dedicated account manager',
      'Full API + integrations',
    ],
    cta: 'Contact Us',
    ctaVariant: 'secondary',
    ctaAction: 'mailto',
    highlighted: false,
  },
];

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Starter plan is free forever — no credit card required. You can upgrade to Growth or Pro whenever you\'re ready to scale.',
  },
  {
    q: 'How does regional pricing work?',
    a: 'We adapt our prices to local purchasing power across Europe. Western European markets have different price points than Southern & Eastern European markets, making FreshFlow accessible to more businesses.',
  },
  {
    q: 'Do you offer discounts for food banks?',
    a: 'Yes! We offer special non-profit pricing for food banks and charitable organizations. Please contact us at hello@freshflow.ai to learn more.',
  },
];

// ─── Region Toggle ────────────────────────────────────────────────────────────

function RegionToggle({ region, onChange }: { region: Region; onChange: (r: Region) => void }) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1">
      <button
        id="region-west"
        onClick={() => onChange('west')}
        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
          region === 'west'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        🌍 Western Europe
      </button>
      <button
        id="region-south"
        onClick={() => onChange('south')}
        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
          region === 'south'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        🌐 Southern & Eastern Europe
      </button>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  region,
  onWaitlist,
}: {
  plan: Plan;
  region: Region;
  onWaitlist: () => void;
}) {
  const price = region === 'west' ? plan.priceWest : plan.priceSouth;

  const ctaBase =
    plan.ctaVariant === 'primary'
      ? 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg'
      : plan.ctaVariant === 'outline'
      ? 'border-2 border-primary text-primary hover:bg-primary-light'
      : 'bg-gray-900 text-white hover:bg-gray-700';

  const handleCta = () => {
    if (plan.ctaAction === 'waitlist') {
      onWaitlist();
    } else {
      window.location.href = 'mailto:hello@freshflow.ai';
    }
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-200 hover:shadow-lg ${
        plan.highlighted
          ? 'bg-white border-primary shadow-md ring-1 ring-primary/20'
          : 'bg-white border-gray-100 shadow-sm'
      }`}
    >
      {/* Tag */}
      {plan.tag && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className={`px-4 py-1 text-xs font-bold rounded-full ${plan.tagColor}`}>
            {plan.tag}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
        <p className="text-sm text-gray-500">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-8">
        {price === null ? (
          <div className="flex items-end gap-1">
            <span className="text-5xl font-black text-gray-900 tracking-tight">Free</span>
            <span className="text-gray-400 text-sm mb-1.5">forever</span>
          </div>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-5xl font-black text-gray-900 tracking-tight">{price}</span>
            <span className="text-gray-400 text-sm mb-1.5">{plan.period}</span>
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, i) => (
          <li
            key={i}
            className={`flex items-start gap-2.5 text-sm ${
              feature.startsWith('Everything in')
                ? 'text-gray-400 font-medium italic'
                : 'text-gray-600'
            }`}
          >
            {!feature.startsWith('Everything in') && (
              <CheckIcon
                className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                  plan.highlighted ? 'text-primary' : 'text-gray-400'
                }`}
              />
            )}
            <span className={feature.startsWith('Everything in') ? 'ml-6' : ''}>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        id={`pricing-cta-${plan.id}`}
        onClick={handleCta}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${ctaBase}`}
      >
        {plan.cta}
      </button>
    </div>
  );
}

// ─── FAQ Section ─────────────────────────────────────────────────────────────

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-lg">Everything you need to know about FreshFlow pricing.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors duration-200"
            >
              <button
                id={`faq-toggle-${i}`}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="text-base font-semibold text-gray-900 pr-4">{faq.q}</span>
                <ChevronIcon open={openIndex === i} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function PricingClient() {
  const [region, setRegion] = useState<Region>('west');
  const [modalOpen, setModalOpen] = useState(false);

  const openWaitlist  = useCallback(() => setModalOpen(true),  []);
  const closeWaitlist = useCallback(() => setModalOpen(false), []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-[Inter,sans-serif]">
      <Navbar onOpenWaitlist={openWaitlist} />

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#F9FAFB] pt-20 pb-8">
          {/* Background blobs */}
          <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -left-24 w-[350px] h-[350px] bg-secondary/6 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            {/* Regional badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full mb-6 border border-amber-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Prices adapt to your local market
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
              Simple, Transparent{' '}
              <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>

            {/* Region Toggle */}
            <RegionToggle region={region} onChange={setRegion} />
          </div>
        </section>

        {/* ── Plan Cards ─────────────────────────────────────────────────────── */}
        <section className="py-16 bg-[#F9FAFB]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  region={region}
                  onWaitlist={openWaitlist}
                />
              ))}
            </div>

            {/* Footnote */}
            <p className="text-center text-xs text-gray-400 mt-8">
              All prices are billed monthly · VAT may apply based on your location · Cancel anytime
            </p>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────────── */}
        <FAQSection />

        {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
        <section className="py-20 bg-gradient-to-br from-primary-dark via-primary to-emerald-400 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v6h6v-6h-6zm0-34v6h6V0h-6zM6 4v6h6V4H6zm0 30v6h6v-6H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
          <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
              Not sure which plan is right for you?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Our team is happy to help you find the best fit for your business.
            </p>
            <a
              id="pricing-bottom-cta"
              href="mailto:hello@freshflow.ai"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 text-base font-bold text-primary bg-white hover:bg-primary-light rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
            >
              Talk to us
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <p className="text-white/60 text-sm mt-5">Or email us at hello@freshflow.ai</p>
          </div>
        </section>
      </main>

      <Footer />

      {/* Waitlist Modal */}
      {modalOpen && <WaitlistModal onClose={closeWaitlist} />}
    </div>
  );
}
