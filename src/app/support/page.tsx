'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: '/support' },
];

const categories = ['Technical Issue', 'Billing', 'Feature Request', 'Bug Report', 'Other'];

const faqs = [
  { q: 'How do I create a website from a Google Maps link?', a: 'Simply paste your Google Maps URL into the generator on the dashboard, and Mapody will automatically scrape your business data and generate a professional website in seconds.' },
  { q: 'Can I use my own domain?', a: 'Yes! Pro and Agency plans support custom domains. Go to your site settings and add your domain, then point your DNS to Mapody.' },
  { q: 'How do credits work?', a: 'Each credit lets you generate one website from a Google Maps URL. Credits reset monthly based on your plan: Free (3), Pro (30), Agency (100).' },
  { q: 'How do I edit my site after publishing?', a: 'Go to your Dashboard, click "Edit" on any site to open the visual editor. You can change themes, sections, colors, and content in real-time.' },
  { q: 'Can I delete my account?', a: 'Yes. Go to your Settings, navigate to the Danger Zone tab, and click "Delete Account". This action is permanent and cannot be undone.' },
  { q: 'How do I report a bug?', a: 'Use the support form below, select "Bug Report" as the category, and describe the issue. Include steps to reproduce if possible.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, and digital wallets. Payment processing is handled securely via Stripe.' },
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

export default function SupportPage() {
  const { data: session } = useSession();
  const [category, setCategory] = useState('Technical Issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSendGmail = () => {
    if (!subject.trim() || !description.trim()) {
      alert('Please fill in the subject and description fields.');
      return;
    }

    const userName = session?.user?.name || 'Not logged in';
    const userEmail = session?.user?.email || 'Not logged in';
    const userPlan = (session?.user as any)?.plan || 'free';

    const to = 'krishna@ideapulley.com';
    const emailSubject = `[Mapody Support] - ${category} - ${subject}`;
    const body = `Hi Mapody Support,

Category: ${category}
Subject: ${subject}

Description:
${description}

---
User Info:
Name: ${userName}
Email: ${userEmail}
Plan: ${userPlan}

Sent via Mapody Support Page`;

    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
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
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[128px] animate-pulse-soft" style={{ background: 'rgba(59,130,246,0.1)' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[128px] animate-pulse-soft" style={{ background: 'rgba(139,92,246,0.08)', animationDelay: '1.5s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              How can we{' '}
              <span className="text-gradient">help</span>?
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Need help? We&apos;re here for you. Send us a message or browse our FAQ below.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* Support Form */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <RevealSection>
              <div className="glass-panel p-8" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-2xl)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-subtle)' }}>
                    <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Contact Support</h2>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>We&apos;ll get back to you via email</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input select"
                      style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      className="input"
                      style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      placeholder="Describe your issue in detail. Include steps to reproduce if reporting a bug."
                      className="input textarea"
                      style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)', minHeight: '8rem' }}
                    />
                  </div>

                  {session && (
                    <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--bg-glass-active)' }}>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Sending as: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{session.user?.name}</span> ({session.user?.email})
                      </p>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        Plan: <span className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{(session.user as any)?.plan || 'free'}</span>
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSendGmail}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 40px rgba(59,130,246,0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(59,130,246,0.3)'; }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Send via Gmail
                  </button>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Quick answers to common questions</p>
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
                    <svg className="w-5 h-5 shrink-0 ml-4 transition-transform duration-200" style={{ color: 'var(--text-tertiary)', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      {/* Contact Info */}
      <section className="py-24" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Still need help?</h2>
            <p className="mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Our team is ready to assist you with any questions.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  ),
                  title: 'Email Us',
                  detail: 'krishna@ideapulley.com',
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: 'Response Time',
                  detail: 'Within 24 hours',
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  ),
                  title: 'Help Center',
                  detail: 'Browse our FAQ',
                },
              ].map((item) => (
                <div key={item.title} className="glass-panel p-6 text-center transition-all"
                  style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-2xl)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.detail}</p>
                </div>
              ))}
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
