'use client';

import Link from 'next/link';
import { useState } from 'react';

// ─── Icons ───────────────────────────────────────────────────────────────────

function LogoIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <LogoIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">FreshFlow</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-150"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors duration-150"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-150"
            onClick={() => setOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl text-center shadow-sm transition-all duration-200"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F9FAFB] pt-20 pb-28">
      {/* Subtle background gradient blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-light text-primary-dark text-xs font-semibold rounded-full mb-6 border border-primary/20">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Now in Early Access · Amsterdam & Beyond
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Stop Fresh Food Waste{' '}
              <span className="text-primary">Before It Happens</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
              AI-powered demand forecasting + surplus matching for independent wholesalers, retailers and restaurants across Europe.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                id="hero-cta-primary"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              >
                Start Free
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                id="hero-cta-secondary"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-gray-700 bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                See How It Works
              </a>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><CheckIcon /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckIcon /> 5-min setup</span>
              <span className="flex items-center gap-1.5"><CheckIcon /> GDPR compliant</span>
            </div>
          </div>

          {/* Mock Dashboard Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
              {/* Header bar */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Week Overview</p>
                  <p className="text-base font-bold text-gray-800 mt-0.5">Surplus Risk Forecast</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-600 rounded-lg border border-amber-100">3 items at risk</span>
              </div>

              {/* Risk Items */}
              <div className="space-y-2.5">
                {[
                  { name: 'Cherry Tomatoes', kg: '120 kg', days: '2 days', risk: 'High' },
                  { name: 'Mixed Salad', kg: '80 kg', days: '3 days', risk: 'Medium' },
                  { name: 'Bell Peppers', kg: '45 kg', days: '5 days', risk: 'Low' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.kg} · expires in {item.days}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      item.risk === 'High'
                        ? 'bg-red-50 text-red-500 border border-red-100'
                        : item.risk === 'Medium'
                        ? 'bg-amber-50 text-amber-500 border border-amber-100'
                        : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>{item.risk}</span>
                  </div>
                ))}
              </div>

              {/* Impact mini-row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { label: 'Saved', value: '340 kg', color: 'text-primary' },
                  { label: 'CO₂', value: '0.68 t', color: 'text-secondary' },
                  { label: 'Revenue', value: '€420', color: 'text-amber-500' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className={`text-base font-extrabold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" />
              Live AI forecast
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Problem Section ──────────────────────────────────────────────────────────

function ProblemSection() {
  const problems = [
    {
      icon: '🗑️',
      stat: '1/3',
      label: 'of all food produced is wasted globally every year',
      detail: 'That\'s 1.3 billion tonnes — much of it from poor inventory planning at the supply chain level.',
    },
    {
      icon: '💸',
      stat: '€800B',
      label: 'in annual losses from food waste worldwide',
      detail: 'Independent businesses bear the brunt, without the enterprise AI tools that large chains can afford.',
    },
    {
      icon: '🌍',
      stat: '10%',
      label: 'of global greenhouse emissions from wasted food',
      detail: 'Every tonne of wasted food means unnecessary CO₂ emissions and lost revenue for your business.',
    },
  ];

  return (
    <section id="problem" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">The Problem</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">The Hidden Cost of Inaccurate Forecasting</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Independent operators are left behind by tools designed for corporations — and the planet pays the price.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <div key={p.stat} className="bg-[#F9FAFB] rounded-2xl p-8 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
              <div className="text-4xl mb-5">{p.icon}</div>
              <p className="text-5xl font-extrabold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200">{p.stat}</p>
              <p className="text-base font-semibold text-gray-800 mb-3 leading-snug">{p.label}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: <UploadIcon />,
      title: 'Upload your sales & stock data',
      description: 'Connect your inventory in minutes by uploading CSV or Excel files. No complex integrations or developer needed.',
      tag: 'CSV or Excel',
    },
    {
      number: '02',
      icon: <ChartIcon />,
      title: 'Get 1–7 day surplus risk forecasts',
      description: 'Our AI analyses your historical data and market signals to predict which products are at risk of spoilage — before it\'s too late.',
      tag: 'AI Powered',
    },
    {
      number: '03',
      icon: <SwapIcon />,
      title: 'Automatically match surplus with buyers',
      description: 'FreshFlow connects your surplus stock with nearby buyers or local food banks, recovering value instead of incurring losses.',
      tag: 'Marketplace',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Three Steps to Zero Waste</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">From data to action in under five minutes. FreshFlow is built for speed and simplicity.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 z-0" />

          {steps.map((step, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
                  {step.icon}
                </div>
                <span className="text-5xl font-black text-gray-100 leading-none select-none">{step.number}</span>
              </div>
              <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-primary-light text-primary-dark rounded-full mb-3">{step.tag}</span>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Key Features ─────────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      emoji: '⚡',
      title: 'Ultra-low friction onboarding',
      description: 'Go from sign-up to your first forecast in under 5 minutes. Just upload a CSV — no IT team, no integrations.',
    },
    {
      emoji: '🔮',
      title: 'Forecast + Marketplace in one flow',
      description: 'Demand forecasting and surplus matching in a single seamless workflow — no toggling between different tools.',
    },
    {
      emoji: '🏪',
      title: 'Built for independent operators',
      description: 'Priced and designed for mid-sized wholesalers, retailers, and restaurant groups. Not an enterprise suite.',
    },
    {
      emoji: '📊',
      title: 'Automatic impact tracking',
      description: 'Every kg saved and tonne of CO₂ avoided is tracked automatically. Export your ESG report in one click.',
    },
    {
      emoji: '🏆',
      title: 'City-level monthly competitions',
      description: 'Compete with other local businesses. Leaderboards, badges and prizes make sustainability genuinely engaging.',
    },
    {
      emoji: '🔒',
      title: 'GDPR-first, Europe-native',
      description: 'Data stays in the EU. We\'re built from the ground up for European regulatory requirements and food safety standards.',
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything You Need, Nothing You Don't</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Powerful enough for a professional operation, simple enough for a single-store owner.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-7 bg-[#F9FAFB] rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-white hover:shadow-md transition-all duration-200">
              <div className="text-3xl mb-4">{f.emoji}</div>
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Impact Strip ─────────────────────────────────────────────────────────────

function ImpactSection() {
  const stats = [
    { value: '2,340 kg', label: 'food saved from landfill' },
    { value: '4.7 t', label: 'CO₂ emissions avoided' },
    { value: '€3,120', label: 'revenue recovered' },
    { value: '18', label: 'businesses onboarded' },
  ];

  return (
    <section id="impact" className="py-24 bg-gradient-to-br from-primary-dark via-primary to-emerald-400 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zNHY2aDZ2LTZoLTZ6TTYgNHY2aDZWNEg2em0wIDMwdjZoNnYtNkg2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">Real Results</p>
        <h2 className="text-4xl font-extrabold text-white mb-4">Proven Impact from Early Users</h2>
        <p className="text-white/80 text-lg mb-14">Real results from early users in Amsterdam &amp; beyond — in just the first 3 months.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-200">
              <p className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">{s.value}</p>
              <p className="text-white/70 text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section id="cta" className="py-28 bg-[#F9FAFB]">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-8 shadow-sm">
          <LogoIcon className="h-9 w-9 text-primary" />
        </div>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
          Ready to turn surplus <br className="hidden sm:block" />into value?
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
          Join the European businesses already reducing waste and recovering revenue with FreshFlow.
        </p>
        <Link
          href="/dashboard"
          id="final-cta-button"
          className="inline-flex items-center justify-center gap-2 px-10 py-4 text-lg font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
        >
          Get Early Access
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="text-sm text-gray-400 mt-5">No credit card required · Built for European businesses · Cancel anytime</p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
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

          {/* Links */}
          <div>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-2.5">
              {['Features', 'How It Works', 'Impact', 'Pricing'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors duration-150">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              {['About', 'Privacy', 'Contact', 'Blog'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors duration-150">{link}</a>
                </li>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-[Inter,sans-serif]">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ImpactSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
