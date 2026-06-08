'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { FONT_PAIRINGS, ALL_SECTIONS } from '@/lib/ai';
import type { SectionId, TeamMember, Promotion, Certification, BeforeAfterItem, Testimonial } from '@/lib/ai';

interface SiteData {
  name?: string;
  category?: string;
  description?: string;
  phone?: string;
  address?: string;
  website?: string;
  rating?: number;
  totalReviews?: number;
  openingHours?: Record<string, string>;
  images?: string[];
  reviews?: Array<{ authorName?: string; rating?: number; text?: string }>;
  aiAbout?: string;
  aiTagline?: string;
  sentiment?: { overall: string; highlights: string[] };
  faqs?: Array<{ question: string; answer: string }>;
  teamMembers?: TeamMember[];
  promotions?: Promotion[];
  certifications?: Certification[];
  beforeAfter?: BeforeAfterItem[];
  testimonials?: Testimonial[];
  areaServed?: string[];
  parkingInfo?: string;
  accessibilityInfo?: string;
  petFriendly?: boolean;
  familyFriendly?: boolean;
  services?: string[];
  childLocations?: string[];
  logo?: string;
}

interface SiteResponse {
  data: SiteData;
  theme?: string;
  sectionOrder?: SectionId[];
  sections?: Record<string, boolean>;
  fontPairing?: string;
  customColors?: { primary: string; secondary: string; accent: string; bg: string; text: string };
  stickyHeader?: boolean;
  darkMode?: boolean;
  bgPattern?: string;
  entranceAnim?: string;
  favicon?: string;
  subdomain?: string;
}

const DEFAULT_COLORS = { primary: '#4361ee', secondary: '#1a1a2e', accent: '#6c8cff', bg: '#ffffff', text: '#0f172a' };
const DEFAULT_SECTION_ORDER: SectionId[] = ALL_SECTIONS.map(s => s.id);
const DEFAULT_SECTIONS: Record<string, boolean> = Object.fromEntries(ALL_SECTIONS.map(s => [s.id, ['hero', 'about', 'hours', 'gallery', 'reviews', 'services', 'location', 'contact', 'footer', 'tagline', 'sentiment', 'faq', 'badges'].includes(s.id)]));

export default function PreviewPage({ params }: { params: { siteId: string } }) {
  const [site, setSite] = useState<SiteResponse | null>(null);

  useEffect(() => {
    fetch(`/api/sites/${params.siteId}`)
      .then(r => r.json())
      .then(s => setSite(s))
      .catch(() => {});
  }, [params.siteId]);

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const data = site.data || {};
  const colors = site.customColors || DEFAULT_COLORS;
  const sectionOrder = site.sectionOrder || DEFAULT_SECTION_ORDER;
  const sections = site.sections || DEFAULT_SECTIONS;
  const darkMode = site.darkMode || false;
  const entranceAnim = site.entranceAnim || 'fade-up';
  const fontPairing = site.fontPairing || 'inter-system';
  const font = FONT_PAIRINGS.find(f => f.id === fontPairing) || FONT_PAIRINGS[0];

  const bg = darkMode ? '#1a1a2e' : colors.bg;
  const txt = darkMode ? '#f1f5f9' : colors.text;
  const animStyle = entranceAnim !== 'none' ? { animation: `${entranceAnim} 0.6s ease-out forwards` } : {};

  const name = data.name || 'Business';
  const cat = data.category || '';
  const addr = data.address || '';
  const phone = data.phone || '';
  const rating = data.rating || 0;
  const totalReviews = data.totalReviews || 0;
  const hours = data.openingHours || {};
  const images = data.images || [];
  const reviews = data.reviews || [];

  const metaTitle = `${name} | ${cat || 'Business Website'}`;
  const metaDesc = data.aiAbout || data.description || `${name} - ${cat}. ${addr}. Visit us for great products and services.`;
  const metaImage = images[0] || '';
  const siteUrl = `https://${site?.subdomain || 'site'}.mapody.site`;

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description: metaDesc,
    image: metaImage,
    telephone: phone,
    address: addr ? { "@type": "PostalAddress", streetAddress: addr } : undefined,
    aggregateRating: rating > 0 ? { "@type": "AggregateRating", ratingValue: rating, reviewCount: totalReviews } : undefined,
    openingHours: Object.keys(hours).length > 0 ? Object.entries(hours).map(([day, h]) => `${day.substring(0, 2)} ${h}`) : undefined,
    url: siteUrl,
  };

  const renderSection = (id: string) => {
    if (!sections[id]) return null;
    switch (id) {
      case 'hero': return (
        <section key={id} style={{ ...animStyle, background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})` }} className="py-20 px-4 text-center">
          {(data.logo as string) && (
            <div className="mb-6">
              <img src={data.logo as string} alt={`${name} logo`} className="h-16 mx-auto object-contain" />
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />Open Now
          </div>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: font.css }}>{name}</h1>
          <p className="text-xl text-white/70 mb-2">{cat}</p>
          {data.aiTagline && <p className="text-lg text-white/90 italic mb-8">{data.aiTagline}</p>}
          <div className="flex gap-4 justify-center">
            {phone && <a href={`tel:${phone}`} className="px-8 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors">📞 Call Now</a>}
            <a href={`https://maps.google.com/?q=${encodeURIComponent(addr)}`} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors">Get Directions</a>
          </div>
        </section>
      );
      case 'tagline': return data.aiTagline ? (
        <section key={id} style={{ ...animStyle, background: bg, color: txt }} className="py-8 px-4 text-center">
          <p className="text-xl italic" style={{ color: colors.primary }}>{data.aiTagline}</p>
        </section>
      ) : null;
      case 'about': return (
        <section key={id} style={{ ...animStyle, background: bg, color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>About Us</h2>
          <p className="text-lg leading-relaxed opacity-80">{data.aiAbout || data.description || 'Business description.'}</p>
        </section>
      );
      case 'sentiment': return data.sentiment && data.sentiment.highlights.length > 0 ? (
        <section key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">What Customers Love</h2>
            <div className="flex flex-wrap gap-3">
              {data.sentiment.highlights.map(h => (
                <span key={h} className="px-4 py-2 rounded-full font-medium" style={{ background: `${colors.primary}20`, color: colors.primary }}>{h}</span>
              ))}
            </div>
          </div>
        </section>
      ) : null;
      case 'hours': return Object.keys(hours).length > 0 ? (
        <section key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>Hours</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(hours).map(([day, h]) => (
              <div key={day} className="flex items-center justify-between p-4 rounded-xl" style={{ background: darkMode ? '#0f172a' : '#ffffff' }}>
                <span className="font-medium">{day}</span>
                <span className="opacity-70">{h}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null;
      case 'gallery': return (
        <section key={id} style={{ ...animStyle, background: bg, color: txt }} className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.slice(0, 9).map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-gray-200">
                  <img src={img} alt={`${name} photo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
      case 'reviews': return reviews.length > 0 ? (
        <section key={id} style={{ ...animStyle, background: bg, color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>Reviews</h2>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-5xl font-bold">{rating}</span>
            <div>
              <div className="flex text-yellow-400 text-xl">★★★★★</div>
              <p className="opacity-60">Based on {totalReviews} reviews</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.slice(0, 6).map((r, i) => (
              <div key={i} className="p-6 rounded-2xl border" style={{ background: darkMode ? '#0f172a' : '#f8fafc', borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ background: colors.primary }}>
                    {(r.authorName || 'A').charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{r.authorName}</p>
                    <div className="text-yellow-400 text-sm">{'★'.repeat(r.rating || 0)}</div>
                  </div>
                </div>
                <p className="opacity-80">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null;
      case 'services': return (data.services && data.services.length > 0) ? (
        <section key={id} style={{ ...animStyle, background: bg, color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>Services</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {data.services.map((s, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: `${colors.primary}10` }}>{s}</div>
            ))}
          </div>
        </section>
      ) : null;
      case 'faq': return data.faqs && data.faqs.length > 0 ? (
        <section key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              {data.faqs.map((f, i) => (
                <div key={i} className="p-6 rounded-2xl border" style={{ background: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                  <p className="font-semibold text-lg mb-2">{f.question}</p>
                  <p className="opacity-80">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null;
      case 'promos': return data.promotions && data.promotions.filter(p => p.active).length > 0 ? (
        <section key={id} style={{ ...animStyle, background: bg, color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>🎉 Specials & Promotions</h2>
          <div className="space-y-4">
            {data.promotions.filter(p => p.active).map(p => (
              <div key={p.id} className="p-6 rounded-2xl border-2 border-dashed" style={{ borderColor: colors.primary }}>
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="opacity-80 mt-2">{p.description}</p>
                {p.expiryDate && <p className="text-sm opacity-50 mt-3">Expires: {p.expiryDate}</p>}
              </div>
            ))}
          </div>
        </section>
      ) : null;
      case 'team': return data.teamMembers && data.teamMembers.length > 0 ? (
        <section key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>Meet Our Team</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {data.teamMembers.map(m => (
                <div key={m.id} className="text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-white" style={{ background: colors.primary }}>
                    {m.name.charAt(0)}
                  </div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm opacity-60">{m.role}</p>
                  {m.bio && <p className="text-xs opacity-40 mt-1">{m.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null;
      case 'certs': return data.certifications && data.certifications.length > 0 ? (
        <section key={id} style={{ ...animStyle, background: bg, color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>🏆 Certifications & Awards</h2>
          <div className="flex flex-wrap gap-4">
            {data.certifications.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: `${colors.primary}10` }}>
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm opacity-60">{c.issuer} {c.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null;
      case 'before-after': return data.beforeAfter && data.beforeAfter.length > 0 ? (
        <section key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>Before & After</h2>
          <div className="space-y-8">
            {data.beforeAfter.map(b => (
              <div key={b.id}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-200"><img src={b.beforeUrl} alt="Before" className="w-full h-full object-cover" /></div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-200"><img src={b.afterUrl} alt="After" className="w-full h-full object-cover" /></div>
                </div>
                {b.caption && <p className="text-sm mt-3 opacity-70 text-center">{b.caption}</p>}
              </div>
            ))}
          </div>
        </section>
      ) : null;
      case 'testimonials': return data.testimonials && data.testimonials.length > 0 ? (
        <section key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>💬 What People Say</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.testimonials.map(t => (
                <div key={t.id} className="p-6 rounded-2xl border" style={{ background: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold">{t.name}</span>
                    <span className="text-yellow-400">{'★'.repeat(t.rating)}</span>
                    <span className="text-xs opacity-40">{t.source}</span>
                  </div>
                  <p className="opacity-80 italic">&ldquo;{t.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null;
      case 'area': return data.areaServed && data.areaServed.length > 0 ? (
        <section key={id} style={{ ...animStyle, background: bg, color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>📍 Areas We Serve</h2>
          <div className="flex flex-wrap gap-3">
            {data.areaServed.map(a => (
              <span key={a} className="px-4 py-2 rounded-full font-medium" style={{ background: `${colors.primary}20`, color: colors.primary }}>{a}</span>
            ))}
          </div>
        </section>
      ) : null;
      case 'parking': return (data.parkingInfo || data.accessibilityInfo || data.petFriendly || data.familyFriendly) ? (
        <section key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>Parking & Accessibility</h2>
            <div className="space-y-3">
              {data.parkingInfo && <p className="opacity-80">🅿️ {data.parkingInfo}</p>}
              {data.accessibilityInfo && <p className="opacity-80">♿ {data.accessibilityInfo}</p>}
              <div className="flex gap-3">
                {data.petFriendly && <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium">🐾 Pet Friendly</span>}
                {data.familyFriendly && <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-medium">👨‍👩‍👧‍👦 Family Friendly</span>}
              </div>
            </div>
          </div>
        </section>
      ) : null;
      case 'badges': return (data.petFriendly || data.familyFriendly) ? (
        <section key={id} style={{ ...animStyle, background: bg, color: txt }} className="py-8 px-4 text-center">
          <div className="flex gap-4 justify-center">
            {data.petFriendly && <span className="px-6 py-3 rounded-full bg-green-100 text-green-700 font-semibold">🐾 Pet Friendly</span>}
            {data.familyFriendly && <span className="px-6 py-3 rounded-full bg-purple-100 text-purple-700 font-semibold">👨‍👩‍👧‍👦 Family Friendly</span>}
          </div>
        </section>
      ) : null;
      case 'location': return (
        <section key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>Find Us</h2>
          <div className="aspect-video rounded-2xl flex items-center justify-center mb-6" style={{ background: darkMode ? '#0f172a' : '#e2e8f0' }}>
            <div className="text-center opacity-40">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              <p>Google Map</p>
            </div>
          </div>
          <p className="opacity-80">{addr}</p>
        </section>
      );
      case 'contact': return (
        <section key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>Contact</h2>
          <div className="space-y-3 opacity-80">
            {phone && <p className="flex items-center gap-2">📞 <a href={`tel:${phone}`} className="hover:underline" style={{ color: colors.primary }}>{phone}</a></p>}
            {addr && <p className="flex items-center gap-2">📍 {addr}</p>}
            {data.website && <p className="flex items-center gap-2">🌐 <a href={data.website as string} className="hover:underline" style={{ color: colors.primary }} target="_blank" rel="noopener noreferrer">{data.website as string}</a></p>}
          </div>
        </section>
      );
      case 'contact-form': return (
        <ContactForm key={id} siteId={params.siteId} siteName={name} colors={colors} darkMode={darkMode} animStyle={animStyle} fontCss={font.css} />
      );
      case 'multi-location': return data.childLocations && data.childLocations.length > 0 ? (
        <section key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: font.css }}>🏢 All Locations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.childLocations.map((loc, i) => (
              <div key={i} className="p-4 rounded-xl border" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                <p className="font-medium">{loc}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null;
      case 'footer': return (
        <footer key={id} style={{ background: colors.secondary }} className="py-8 px-4 text-center">
          <p className="text-white/60 text-sm mb-4">{name} • {addr}</p>
          <p className="text-white/40 text-xs">Powered by Mapody</p>
        </footer>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: bg, color: txt, fontFamily: font.css }}>
      <>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        {metaImage && <meta property="og:image" content={metaImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        {metaImage && <meta name="twitter:image" content={metaImage} />}
        <link rel="canonical" href={siteUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
      </>
      <div className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: colors.secondary, borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-white/60 hover:text-white">← Back to Dashboard</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60">Preview Mode</span>
            <Link href={`/editor?id=${params.siteId}`} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: colors.primary }}>Edit Site</Link>
          </div>
        </div>
      </div>
      <div className="pt-14">
        {sectionOrder.map(id => renderSection(id))}
      </div>
    </div>
  );
}

function ContactForm({ siteId, siteName, colors, darkMode, animStyle, fontCss }: {
  siteId: string; siteName: string; colors: { primary: string; secondary: string }; darkMode: boolean;
  animStyle: React.CSSProperties; fontCss: string;
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, ...form }),
      });
      if (res.ok) setSubmitted(true);
    } catch {} finally { setSending(false); }
  };

  if (submitted) {
    return (
      <section style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: darkMode ? '#f1f5f9' : '#0f172a' }} className="py-16 px-4 max-w-4xl mx-auto text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: fontCss }}>Thank You!</h2>
        <p className="opacity-80">Your message has been sent to {siteName}. We&apos;ll get back to you soon.</p>
      </section>
    );
  }

  return (
    <section style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: darkMode ? '#f1f5f9' : '#0f172a' }} className="py-16 px-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: fontCss }}>Send Us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-20 outline-none transition-all" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0', background: darkMode ? '#0f172a' : '#ffffff', '--tw-ring-color': colors.primary } as React.CSSProperties} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-20 outline-none transition-all" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0', background: darkMode ? '#0f172a' : '#ffffff', '--tw-ring-color': colors.primary } as React.CSSProperties} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-20 outline-none transition-all" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0', background: darkMode ? '#0f172a' : '#ffffff', '--tw-ring-color': colors.primary } as React.CSSProperties} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message *</label>
          <textarea required rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-20 outline-none transition-all resize-none" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0', background: darkMode ? '#0f172a' : '#ffffff', '--tw-ring-color': colors.primary } as React.CSSProperties} />
        </div>
        <button type="submit" disabled={sending} className="px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50" style={{ background: colors.primary }}>
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </section>
  );
}
