'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

const MAP_PINS = [
  { top: '18%', left: '12%', color: '#EA4335', delay: 0, size: 'lg' },
  { top: '25%', right: '18%', color: '#4285F4', delay: 0.5, size: 'md' },
  { top: '55%', left: '8%', color: '#FBBC05', delay: 1, size: 'sm' },
  { top: '65%', right: '12%', color: '#34A853', delay: 1.5, size: 'md' },
  { top: '40%', left: '25%', color: '#7B61FF', delay: 0.8, size: 'lg' },
  { top: '75%', left: '30%', color: '#EA4335', delay: 2, size: 'sm' },
  { top: '35%', right: '30%', color: '#4285F4', delay: 1.2, size: 'sm' },
  { top: '80%', right: '25%', color: '#FBBC05', delay: 0.3, size: 'md' },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Google Maps Integration',
    desc: 'Paste any Google Maps link and we scrape business name, address, phone, reviews, photos, and hours automatically.',
    color: '#EA4335',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.875 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
    title: 'AI Content Generation',
    desc: 'Smart copy, FAQs, taglines, and descriptions generated from real business data — no manual writing needed.',
    color: '#4285F4',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'Multi-Page Sites',
    desc: 'Generate complete websites with Home, About, Services, Gallery, and Contact pages automatically.',
    color: '#34A853',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
      </svg>
    ),
    title: 'Custom Themes',
    desc: 'Choose from professionally designed themes or match your brand colors in one click.',
    color: '#FBBC05',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    title: 'Analytics Dashboard',
    desc: 'Track page views, visitor behavior, and engagement with built-in analytics — no third party needed.',
    color: '#7B61FF',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'One-Click Publishing',
    desc: 'Go live instantly on your free *.mapody.site subdomain or connect a custom domain with SSL.',
    color: '#EA4335',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Paste Your Google Maps URL',
    desc: 'Copy any Google Maps business link and paste it into the generator. Works with place URLs, short links, and embeds.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    color: '#EA4335',
  },
  {
    num: '02',
    title: 'AI Generates Your Site',
    desc: 'Our engine scrapes your business data and crafts a multi-page, professionally designed website in seconds.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.875 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
    color: '#4285F4',
  },
  {
    num: '03',
    title: 'Customize & Publish',
    desc: 'Tweak colors, fonts, and content in the visual editor. Hit publish and your site goes live instantly.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    color: '#34A853',
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
    color: '#34A853',
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
    ctaClass: 'text-white hover:opacity-90',
    highlighted: true,
    color: '#4285F4',
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
    color: '#FBBC05',
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
    <div className="min-h-screen bg-[#0d1117] overflow-hidden">
      {/* ── Navigation ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <Link href="/" className="flex items-center gap-3 group">
              <Image src="/logo.png" alt="Mapody" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold text-white tracking-tight hidden sm:block">Mapody</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Support', href: '/support' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-[#4285F4] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3367D6] transition-colors shadow-[0_0_20px_rgba(66,133,244,0.3)]"
              >
                Get Started
              </Link>
            </div>

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

        <div
          className={`md:hidden fixed inset-0 top-16 bg-[#0d1117]/98 backdrop-blur-2xl transition-all duration-300 z-40 ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col p-6 gap-2">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Support', href: '/support' },
            ].map((link) => (
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
              className="bg-[#4285F4] text-white px-4 py-3.5 rounded-xl text-base font-semibold text-center mt-2"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dark map-inspired background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]" />

        {/* Grid pattern like a map */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(66,133,244,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(66,133,244,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Colored glows like map regions */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] bg-[#EA4335]/8 rounded-full blur-[120px]" />
          <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] bg-[#4285F4]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[15%] left-[30%] w-[300px] h-[300px] bg-[#34A853]/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-[25%] right-[25%] w-[250px] h-[250px] bg-[#FBBC05]/6 rounded-full blur-[100px]" />
        </div>

        {/* Floating map pins */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {MAP_PINS.map((pin, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                top: pin.top,
                left: pin.left,
                right: pin.right,
                animationDelay: `${pin.delay}s`,
                animationDuration: `${6 + i}s`,
              }}
            >
              <svg
                width={pin.size === 'lg' ? 28 : pin.size === 'md' ? 22 : 16}
                height={pin.size === 'lg' ? 36 : pin.size === 'md' ? 28 : 22}
                viewBox="0 0 24 32"
                fill="none"
              >
                <path
                  d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z"
                  fill={pin.color}
                  fillOpacity="0.6"
                />
                <circle cx="12" cy="12" r="5" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8"
            style={{ animation: 'fade-up 0.6s ease-out forwards' }}
          >
            <span className="w-2 h-2 bg-[#34A853] rounded-full animate-pulse" />
            <span className="text-white/70 text-sm font-medium">Powered by Google Maps Data</span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6"
            style={{ animation: 'fade-up 0.7s ease-out 0.1s both' }}
          >
            Turn{' '}
            <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] bg-clip-text text-transparent">
              Google Maps
            </span>
            <br className="hidden sm:block" />
            Into a Website
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ animation: 'fade-up 0.7s ease-out 0.2s both' }}
          >
            Paste any Google Maps business link. Our AI scrapes the data, generates professional copy, and builds a beautiful multi-page site — all before your coffee cools.
          </p>

          {/* URL Input */}
          <div
            className="max-w-2xl mx-auto mb-6"
            style={{ animation: 'fade-up 0.7s ease-out 0.3s both' }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] rounded-2xl opacity-20 group-hover:opacity-35 blur transition-opacity duration-500" />
              <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-[#161b22]/90 backdrop-blur-xl rounded-2xl border border-white/10">
                {/* Map pin icon */}
                <div className="hidden sm:flex items-center pl-3">
                  <svg className="w-5 h-5 text-[#EA4335]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
                  </svg>
                </div>
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
                  className="bg-[#4285F4] text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#3367D6] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(66,133,244,0.3)] hover:shadow-[0_0_30px_rgba(66,133,244,0.5)] whitespace-nowrap"
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
                      Generate Site
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
              <svg className="w-4 h-4 text-[#34A853]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#34A853]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Free forever plan
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#34A853]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              60-second setup
            </span>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d1117] to-transparent" />
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 lg:py-32 bg-[#0d1117] relative">
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
                  <div className="text-7xl font-black text-white/[0.03] absolute top-6 right-8 select-none group-hover:text-white/[0.06] transition-colors">
                    {step.num}
                  </div>

                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${step.color}20`, border: `1px solid ${step.color}30` }}
                  >
                    <div style={{ color: step.color }}>{step.icon}</div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-white/40 leading-relaxed">{step.desc}</p>

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
      <section id="features" className="py-24 lg:py-32 bg-[#161b22] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117]" />
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
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${feature.color}15`, border: `1px solid ${feature.color}25` }}
                  >
                    <div style={{ color: feature.color }}>{feature.icon}</div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2.5">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Map Preview Section ── */}
      <section className="py-24 lg:py-32 bg-[#0d1117] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              See It In Action
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Watch how a simple Google Maps link transforms into a complete website.
            </p>
          </RevealSection>

          <RevealSection>
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] rounded-2xl opacity-20 blur" />
              <div className="relative bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EA4335]/60" />
                    <div className="w-3 h-3 rounded-full bg-[#FBBC05]/60" />
                    <div className="w-3 h-3 rounded-full bg-[#34A853]/60" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-lg text-xs text-white/30">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                      coffee-shop.mapody.site
                    </div>
                  </div>
                </div>

                {/* Mock website content */}
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#EA4335] to-[#FBBC05] flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">The Cozy Bean</h3>
                      <p className="text-white/40 text-sm">Artisan Coffee & Pastries</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Rating', value: '4.8', icon: '★' },
                      { label: 'Reviews', value: '342', icon: '💬' },
                      { label: 'Open Now', value: '8am-9pm', icon: '🕐' },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                        <div className="text-lg mb-1">{stat.icon}</div>
                        <div className="text-white font-semibold text-sm">{stat.value}</div>
                        <div className="text-white/30 text-xs">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {['About Us', 'Menu', 'Gallery', 'Reviews', 'Contact'].map((page, i) => (
                      <div key={page} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-[#4285F4]/20 flex items-center justify-center text-[#4285F4] text-xs font-bold">{i + 1}</div>
                        <span className="text-white/60 text-sm">{page}</span>
                        <svg className="w-4 h-4 text-white/20 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-24 lg:py-32 bg-[#161b22] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Trusted by 500+ Businesses
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Join hundreds of businesses that launched their web presence with Mapody.
            </p>
          </RevealSection>

          <RevealSection>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
              {[
                { value: '500+', label: 'Sites Created', color: '#4285F4' },
                { value: '10,000+', label: 'Pages Built', color: '#34A853' },
                { value: '98%', label: 'Satisfaction', color: '#FBBC05' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-white/40 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Pricing Preview ── */}
      <section className="py-24 lg:py-32 bg-[#0d1117] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#161b22] via-[#0d1117] to-[#161b22]" />
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
                      ? 'border-2 bg-white/[0.04]'
                      : 'border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]'
                  }`}
                  style={plan.highlighted ? { borderColor: `${plan.color}50`, boxShadow: `0 0 30px ${plan.color}20` } : {}}
                >
                  {plan.highlighted && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-xs font-semibold rounded-full"
                      style={{ backgroundColor: plan.color, boxShadow: `0 0 20px ${plan.color}40` }}
                    >
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: plan.color }}>
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
                          <svg className="w-4 h-4 text-[#34A853] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
                    <button
                      className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${plan.ctaClass}`}
                      style={!plan.highlighted ? {} : { backgroundColor: plan.color }}
                    >
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4]/10 via-[#0d1117] to-[#EA4335]/8" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#4285F4]/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-[#EA4335]/6 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <div className="mb-8">
              <Image src="/logo.png" alt="Mapody" width={64} height={64} className="mx-auto rounded-xl" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Build Your Website?
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
              Join 500+ businesses who launched their online presence with Mapody. It takes less than a minute.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="bg-[#4285F4] text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#3367D6] transition-all shadow-[0_0_20px_rgba(66,133,244,0.3)] hover:shadow-[0_0_30px_rgba(66,133,244,0.5)] inline-flex items-center gap-2"
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
      <footer className="border-t border-white/[0.06] bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16 mb-12">
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

          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Mapody" width={32} height={32} className="rounded-lg" />
              <span className="text-base font-bold text-white/80">Mapody</span>
            </div>

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

            <div className="text-white/25 text-sm">
              Powered by Mapody &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
