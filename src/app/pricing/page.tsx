'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: '/support' },
];

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out Mapody',
    credits: '3 credits/mo',
    pages: '3 pages each',
    features: [
      { text: '3 credits per month', included: true },
      { text: '3 pages per site', included: true },
      { text: '*.mapody.site subdomain', included: true },
      { text: 'Basic themes', included: true },
      { text: 'Community support', included: true },
      { text: 'Custom domain', included: false },
      { text: 'Priority support', included: false },
      { text: 'Analytics', included: false },
      { text: 'White label', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For professionals who need more',
    credits: '30 credits/mo',
    pages: '5 pages each',
    features: [
      { text: '30 credits per month', included: true },
      { text: '5 pages per site', included: true },
      { text: 'Custom domain support', included: true },
      { text: 'All premium themes', included: true },
      { text: 'Priority support', included: true },
      { text: 'Remove Mapody badge', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'White label', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Buy Pro',
    highlighted: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$29.99',
    period: '/month',
    description: 'For teams and agencies',
    credits: '100 credits/mo',
    pages: '10 pages each',
    features: [
      { text: '100 credits per month', included: true },
      { text: '10 pages per site', included: true },
      { text: 'Custom domain support', included: true },
      { text: 'All premium themes', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'White label option', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom branding', included: true },
      { text: 'API access', included: true },
    ],
    cta: 'Buy Agency',
    highlighted: false,
  },
];

const comparisonFeatures = [
  { name: 'Monthly credits', free: '3', pro: '30', agency: '100' },
  { name: 'Pages per site', free: '3', pro: '5', agency: '10' },
  { name: 'Subdomain', free: 'Yes', pro: 'Yes', agency: 'Yes' },
  { name: 'Custom domain', free: '—', pro: 'Yes', agency: 'Yes' },
  { name: 'Themes', free: 'Basic', pro: 'All Premium', agency: 'All Premium' },
  { name: 'Analytics', free: '—', pro: 'Basic', agency: 'Advanced' },
  { name: 'Support', free: 'Community', pro: 'Priority', agency: 'Dedicated' },
  { name: 'Remove badge', free: '—', pro: 'Yes', agency: 'Yes' },
  { name: 'White label', free: '—', pro: '—', agency: 'Yes' },
  { name: 'API access', free: '—', pro: '—', agency: 'Yes' },
  { name: 'Bulk import', free: '—', pro: '—', agency: 'Yes' },
  { name: 'Custom branding', free: '—', pro: '—', agency: 'Yes' },
];

const faqs = [
  { q: 'What are credits?', a: 'Each credit lets you generate one website from a Google Maps URL. Credits reset monthly based on your plan.' },
  { q: 'Can I upgrade or downgrade anytime?', a: 'Yes! You can switch plans at any time. When upgrading, you\'ll get immediate access to more credits. Downgrades take effect at the next billing cycle.' },
  { q: 'Do unused credits roll over?', a: 'No, credits reset each month. They don\'t roll over to the next month.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, and digital wallets. Payment processing is handled securely via Stripe.' },
  { q: 'Is there a free trial for Pro or Agency?', a: 'You can try Mapody for free with 3 credits. When you\'re ready for more, upgrade to Pro or Agency at any time.' },
  { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime from your dashboard. You\'ll retain access to your plan features until the end of your billing period.' },
];

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
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>
      {children}
    </div>
  );
}

export default function PricingPage() {
  const { data: session } = useSession();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleBuyPlan = (planName: string) => {
    alert(`Payment integration coming soon! You selected the ${planName} plan.`);
  };

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
        style={{
          background: scrolled ? 'rgba(10,10,15,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Mapody</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.label} href={link.href} className="px-4 py-2 text-sm font-medium rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              {session ? (
                <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
                  Dashboard
                </Link>
              ) : (
                <Link href="/auth/login" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
                  Sign In
                </Link>
              )}
            </div>
            <button className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              <span className="block w-5 h-0.5 bg-white transition-all duration-300" style={{ transform: mobileMenuOpen ? 'rotate(45deg) translateY(8px)' : '' }} />
              <span className="block w-5 h-0.5 bg-white transition-all duration-300" style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
              <span className="block w-5 h-0.5 bg-white transition-all duration-300" style={{ transform: mobileMenuOpen ? '-rotate(45deg) translateY(-8px)' : '' }} />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-40" style={{ background: 'rgba(10,10,15,0.98)', backdropFilter: 'blur(24px)' }}>
            <div className="flex flex-col p-6 gap-2">
              {NAV_LINKS.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3.5 text-base font-medium rounded-xl" style={{ color: 'var(--text-secondary)' }}>
                  {link.label}
                </Link>
              ))}
              <div className="my-4" style={{ borderTop: '1px solid var(--border-subtle)' }} />
              <Link href={session ? '/dashboard' : '/auth/login'} onClick={() => setMobileMenuOpen(false)} className="gradient-blue text-white px-4 py-3.5 rounded-xl text-base font-semibold text-center">
                {session ? 'Dashboard' : 'Sign In'}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[128px] animate-pulse-soft" style={{ background: 'rgba(59,130,246,0.1)' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[128px] animate-pulse-soft" style={{ background: 'rgba(139,92,246,0.08)', animationDelay: '1.5s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-glass)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No credit card required</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Simple, transparent{' '}
              <span className="text-gradient">pricing</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Start free, upgrade when you need more. All plans include a Google Maps to website generator.
            </p>
            {session && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'var(--accent-subtle)' }}>
                <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Your current plan: <span className="font-semibold capitalize">{(session.user as any)?.plan || 'free'}</span></span>
              </div>
            )}
          </RevealSection>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <RevealSection key={plan.id} delay={i * 0.12}>
                <div
                  className="relative rounded-2xl p-8 transition-all duration-300 h-full flex flex-col"
                  style={{
                    background: plan.highlighted ? 'var(--bg-glass-hover)' : 'var(--bg-glass)',
                    border: plan.highlighted ? '2px solid rgba(59,130,246,0.5)' : '1px solid var(--border-default)',
                    boxShadow: plan.highlighted ? '0 0 40px rgba(59,130,246,0.2), 0 0 80px rgba(59,130,246,0.1)' : 'none',
                    backdropFilter: 'blur(20px)',
                  }}
                  onMouseEnter={(e) => {
                    if (!plan.highlighted) {
                      e.currentTarget.style.background = 'var(--bg-glass-hover)';
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.highlighted) {
                      e.currentTarget.style.background = 'var(--bg-glass)';
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                    }
                  }}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-semibold shadow-glow"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: plan.highlighted ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                      {plan.name}
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                      <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{plan.period}</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
                  </div>

                  <div className="flex items-center gap-3 mb-6 p-3 rounded-xl" style={{ background: 'var(--bg-glass-active)' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-subtle)' }}>
                      <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.credits}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{plan.pages}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3 text-sm">
                        {feature.included ? (
                          <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                          </svg>
                        )}
                        <span style={{ color: feature.included ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleBuyPlan(plan.name)}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all"
                    style={
                      plan.highlighted
                        ? { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }
                        : { background: 'var(--bg-glass)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }
                    }
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {plan.cta}
                  </button>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Compare Plans</h2>
            <p style={{ color: 'var(--text-secondary)' }}>See what&apos;s included in each plan</p>
          </RevealSection>

          <RevealSection>
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <div className="glass-panel overflow-hidden" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-2xl)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Feature</th>
                      <th className="text-center py-4 px-4 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Free</th>
                      <th className="text-center py-4 px-4 font-semibold text-sm" style={{ color: 'var(--accent)' }}>Pro</th>
                      <th className="text-center py-4 px-4 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Agency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature) => (
                      <tr key={feature.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td className="py-3.5 px-6 text-sm" style={{ color: 'var(--text-primary)' }}>{feature.name}</td>
                        <td className="py-3.5 px-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.free}</td>
                        <td className="py-3.5 px-4 text-center text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{feature.pro}</td>
                        <td className="py-3.5 px-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.agency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Everything you need to know about our plans</p>
          </RevealSection>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <RevealSection key={i} delay={i * 0.05}>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)', background: 'var(--bg-glass)' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
                    <svg className={`w-5 h-5 shrink-0 ml-4 transition-transform duration-200`} style={{ color: 'var(--text-tertiary)', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), var(--bg-primary), rgba(139,92,246,0.15))' }} />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse-soft" style={{ background: 'rgba(59,130,246,0.1)' }} />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse-soft" style={{ background: 'rgba(139,92,246,0.08)', animationDelay: '2s' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Ready to get started?</h2>
            <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
              Join hundreds of businesses who launched their web presence with Mapody. It takes less than a minute.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={session ? '/dashboard' : '/auth/signup'}
                className="px-8 py-4 rounded-xl font-semibold text-white transition-all inline-flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 40px rgba(59,130,246,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(59,130,246,0.3)'; }}
              >
                {session ? 'Go to Dashboard' : 'Get Started Free'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/support" className="px-6 py-4 rounded-xl font-medium transition-all" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-glass)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'transparent'; }}
              >
                Contact Sales
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-base font-bold" style={{ color: 'var(--text-primary)', opacity: 0.8 }}>Mapody</span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} Mapody. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
