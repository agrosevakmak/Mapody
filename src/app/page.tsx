'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isValidGoogleMapsUrl } from '@/lib/apify';

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: '/support' },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: 'AI Content Generation',
    desc: 'Smart copy, FAQs, and descriptions generated from real business data — no manual writing needed.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
      </svg>
    ),
    title: 'Multi-Page Sites',
    desc: 'Generate complete websites with Home, About, Services, Gallery, and Contact pages automatically.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
      </svg>
    ),
    title: 'Custom Themes',
    desc: 'Choose from professionally designed themes or match your brand colors in one click.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
    title: 'Analytics Dashboard',
    desc: 'Track page views, visitor behavior, and engagement with built-in analytics — no third party needed.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    title: 'SEO Optimized',
    desc: 'Auto-generated meta tags, structured data, and semantic HTML so your site ranks from day one.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    title: 'One-Click Publishing',
    desc: 'Go live instantly on your free *.mapody.site subdomain or connect a custom domain with SSL.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Paste Your Google Maps URL',
    desc: 'Copy any Google Maps business link and paste it into the generator. Works with place URLs, short links, and embeds.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'AI Generates Your Site',
    desc: 'Our engine scrapes your business data and crafts a multi-page, professionally designed website in seconds.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.875 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Customize & Publish',
    desc: 'Tweak colors, fonts, and content in the visual editor. Hit publish and your site goes live instantly.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out Mapody',
    features: [
      { text: '3 sites per month', included: true },
      { text: '3 pages per site', included: true },
      { text: '*.mapody.site subdomain', included: true },
      { text: 'Basic templates', included: true },
      { text: 'Community support', included: true },
      { text: 'Custom domain', included: false },
      { text: 'Remove badge', included: false },
      { text: 'Analytics', included: false },
    ],
    cta: 'Get Started Free',
    ctaClass: 'border border-white/20 text-white hover:bg-white/10',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For professionals who need more',
    features: [
      { text: '30 sites per month', included: true },
      { text: '5 pages per site', included: true },
      { text: 'Custom domain support', included: true },
      { text: 'Premium templates', included: true },
      { text: 'Priority support', included: true },
      { text: 'Remove badge', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'API access', included: false },
    ],
    cta: 'Start Pro Trial',
    ctaClass: 'gradient-blue text-white hover:opacity-90',
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '$29.99',
    period: '/month',
    description: 'For teams and agencies',
    features: [
      { text: 'Unlimited sites', included: true },
      { text: '10 pages per site', included: true },
      { text: 'Custom domain support', included: true },
      { text: 'Premium templates', included: true },
      { text: 'Priority support', included: true },
      { text: 'White label option', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'API access', included: true },
    ],
    cta: 'Contact Sales',
    ctaClass: 'border border-white/20 text-white hover:bg-white/10',
    highlighted: false,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleGenerate = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a Google Maps URL');
      return;
    }
    if (!isValidGoogleMapsUrl(url.trim())) {
      setError('Please enter a valid Google Maps URL (e.g., https://google.com/maps/place/...)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to scrape business data');
        return;
      }

      sessionStorage.setItem('scrapedData', JSON.stringify(data));
      router.push('/editor');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [url, router]);

  return (
    <div className="min-h-screen bg-surface-900 overflow-hidden">
      {/* ── Navigation ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-surface-900/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 gradient-blue rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Mapody</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="gradient-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-glow"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`md:hidden fixed inset-0 top-16 bg-surface-900/98 backdrop-blur-2xl transition-all duration-300 z-40 ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col p-6 gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3.5 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-4" />
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3.5 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="gradient-blue text-white px-4 py-3.5 rounded-xl text-base font-semibold text-center mt-2"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[128px] animate-pulse-soft" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[128px] animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/6 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '3s' }} />
        </div>

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-2 h-2 bg-blue-400/40 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '7s' }} />
          <div className="absolute top-[25%] right-[15%] w-1.5 h-1.5 bg-violet-400/30 rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '9s' }} />
          <div className="absolute bottom-[30%] left-[20%] w-1 h-1 bg-sky-300/40 rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '6s' }} />
          <div className="absolute top-[60%] right-[10%] w-2.5 h-2.5 bg-blue-300/20 rounded-full animate-float" style={{ animationDelay: '3s', animationDuration: '8s' }} />
          <div className="absolute top-[40%] left-[60%] w-1 h-1 bg-indigo-400/30 rounded-full animate-float" style={{ animationDelay: '0.5s', animationDuration: '10s' }} />
          <div className="absolute top-[70%] left-[5%] w-1.5 h-1.5 bg-cyan-400/25 rounded-full animate-float" style={{ animationDelay: '4s', animationDuration: '7.5s' }} />
          <div className="absolute top-[10%] right-[40%] w-1 h-1 bg-blue-500/30 rounded-full animate-float" style={{ animationDelay: '2.5s' , animationDuration: '11s' }} />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8"
            style={{ animation: 'fade-up 0.6s ease-out forwards' }}
          >
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/70 text-sm font-medium">Now with AI-powered content generation</span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6"
            style={{ animation: 'fade-up 0.7s ease-out 0.1s both' }}
          >
            Turn Google Maps Into a{' '}
            <span className="text-gradient">Website</span>{' '}
            <br className="hidden sm:block" />
            in 60 Seconds
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ animation: 'fade-up 0.7s ease-out 0.2s both' }}
          >
            Paste any Google Maps business link. Our AI engine scrapes the data, generates professional copy, and builds a beautiful multi-page site — all before your coffee cools.
          </p>

          {/* URL Input */}
          <div
            className="max-w-2xl mx-auto mb-6"
            style={{ animation: 'fade-up 0.7s ease-out 0.3s both' }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-violet-500 to-blue-600 rounded-2xl opacity-30 group-hover:opacity-50 blur transition-opacity duration-500" />
              <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-surface-900/90 backdrop-blur-xl rounded-2xl border border-white/10">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="https://google.com/maps/place/..."
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 px-5 py-4 rounded-xl border-0 focus:ring-0 focus:outline-none text-base"
                  disabled={loading}
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="gradient-blue text-white px-8 py-4 rounded-xl font-semibold text-base hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-glow hover:shadow-glow-lg whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Building...
                    </>
                  ) : (
                    <>
                      Generate
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 justify-center text-red-400 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Trust indicators */}
          <div
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-white/40"
            style={{ animation: 'fade-up 0.7s ease-out 0.4s both' }}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Free forever plan
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              30-second setup
            </span>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-900 to-transparent" />
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 lg:py-32 bg-surface-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-medium uppercase tracking-wider mb-6">
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              From Maps Link to Live Site
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Three steps. No code. No design skills required.
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((step, i) => (
              <RevealSection key={step.num} delay={i * 0.15}>
                <div className="relative group p-8 lg:p-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 h-full">
                  {/* Step number */}
                  <div className="text-7xl font-black text-white/[0.03] absolute top-6 right-8 select-none group-hover:text-white/[0.06] transition-colors">
                    {step.num}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/10 border border-white/[0.08] flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-white/40 leading-relaxed">{step.desc}</p>

                  {/* Connector line (hidden on last) */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-4 w-8 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  )}
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-24 lg:py-32 bg-surface-950 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-950 to-surface-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-medium uppercase tracking-wider mb-6">
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              A complete toolkit to go from Google Maps listing to professional website.
            </p>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <RevealSection key={feature.title} delay={i * 0.08}>
                <div className="group relative p-7 lg:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 h-full hover:-translate-y-1">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/15 to-violet-600/10 border border-white/[0.08] flex items-center justify-center text-blue-400 mb-5 group-hover:text-blue-300 transition-colors">
                    {feature.icon}
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2.5">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-24 lg:py-32 bg-surface-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Trusted by 500+ Businesses
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Join hundreds of businesses that launched their web presence with Mapody.
            </p>
          </RevealSection>

          {/* Stats */}
          <RevealSection>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
              {[
                { value: '500+', label: 'Sites Created' },
                { value: '10,000+', label: 'Pages Built' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-white/40 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </RevealSection>

          {/* Logo cloud placeholder */}
          <RevealSection>
            <div className="text-center">
              <p className="text-white/20 text-xs font-medium uppercase tracking-widest mb-6">Trusted by leading businesses</p>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-20">
                {['Restaurant Group', 'Retail Co.', 'Health Clinic', 'Tech Startup', 'Fitness Hub'].map((name) => (
                  <span key={name} className="text-white/60 text-sm sm:text-base font-semibold tracking-wide">{name}</span>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Pricing Preview ── */}
      <section className="py-24 lg:py-32 bg-surface-950 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-950 to-surface-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-medium uppercase tracking-wider mb-6">
              Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Start free, upgrade when you&apos;re ready. No surprises.
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <RevealSection key={plan.name} delay={i * 0.12}>
                <div
                  className={`relative rounded-2xl p-8 lg:p-10 transition-all duration-300 h-full flex flex-col ${
                    plan.highlighted
                      ? 'border-2 border-blue-500/50 bg-white/[0.04] shadow-glow'
                      : 'border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 gradient-blue text-white text-xs font-semibold rounded-full shadow-glow">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`text-sm font-semibold uppercase tracking-wide mb-2 ${plan.highlighted ? 'text-blue-400' : 'text-white/40'}`}>
                      {plan.name}
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/30 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-white/40 text-sm">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3 text-sm">
                        {feature.included ? (
                          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white/15 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                          </svg>
                        )}
                        <span className={feature.included ? 'text-white/70' : 'text-white/25'}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/pricing" className="block">
                    <button className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${plan.ctaClass}`}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              </RevealSection>
            ))}
          </div>

          <RevealSection className="text-center mt-10">
            <Link href="/pricing" className="text-white/40 hover:text-white/70 text-sm font-medium transition-colors inline-flex items-center gap-1.5">
              View full pricing comparison
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </RevealSection>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-surface-900 to-violet-600/15" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Build Your Website?
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
              Join 500+ businesses who launched their online presence with Mapody. It takes less than a minute.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="gradient-blue text-white px-8 py-4 rounded-xl font-semibold text-base hover:opacity-90 transition-all shadow-glow hover:shadow-glow-lg inline-flex items-center gap-2"
              >
                Get Started Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="text-white/60 hover:text-white px-6 py-4 rounded-xl font-medium text-base transition-colors border border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                View Pricing
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16 mb-12">
            {/* Product */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Editor', href: '/editor' },
                  { label: 'Dashboard', href: '/dashboard' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/35 hover:text-white/70 text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Press'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/35 hover:text-white/70 text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Documentation', href: '#' },
                  { label: 'Support', href: '/support' },
                  { label: 'Status', href: '#' },
                  { label: 'API', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/35 hover:text-white/70 text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/35 hover:text-white/70 text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 gradient-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-base font-bold text-white/80">Mapody</span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-4">
              {[
                { label: 'Twitter', path: 'M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z' },
                { label: 'GitHub', path: 'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z' },
                { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-white/25 text-sm">
              Powered by Mapody &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
