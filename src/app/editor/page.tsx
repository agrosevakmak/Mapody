'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  rewriteAboutUs, generateTagline, analyzeSentiment, generateFAQ,
  generateFaviconSVG, FONT_PAIRINGS, BACKGROUND_PATTERNS, ENTRANCE_ANIMATIONS, ALL_SECTIONS,
} from '@/lib/ai';
import type { FontPairingId, SectionId, TeamMember, Promotion, Certification, BeforeAfterItem, Testimonial } from '@/lib/ai';
import PageManager from '@/components/PageManager';
import { AppDarkModeToggle } from '@/components/AppDarkModeToggle';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const siteId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<'content' | 'ai' | 'sections' | 'theme' | 'design' | 'extras'>('content');
  const [selectedTheme, setSelectedTheme] = useState('modern-light');
  const [mobilePreview, setMobilePreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [sectionDragIdx, setSectionDragIdx] = useState<number | null>(null);
  const [authTimeout, setAuthTimeout] = useState(false);

  const [data, setData] = useState<Record<string, unknown>>({ name: '', category: '', description: '', phone: '', address: '', rating: 0, totalReviews: 0, openingHours: {}, images: [], reviews: [] });
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(ALL_SECTIONS.map(s => s.id));
  const [sections, setSections] = useState<Record<string, boolean>>(Object.fromEntries(ALL_SECTIONS.map(s => [s.id, s.id === 'hero' || s.id === 'about' || s.id === 'hours' || s.id === 'gallery' || s.id === 'reviews' || s.id === 'services' || s.id === 'location' || s.id === 'contact' || s.id === 'footer' || s.id === 'tagline' || s.id === 'sentiment' || s.id === 'faq' || s.id === 'badges'])));

  const [aiAbout, setAiAbout] = useState('');
  const [aiTagline, setAiTagline] = useState('');
  const [sentiment, setSentiment] = useState<{ overall: string; score: number; highlights: string[]; sentimentBreakdown: { positive: number; neutral: number; negative: number } } | null>(null);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [fontPairing, setFontPairing] = useState<FontPairingId>('inter-system');
  const [customColors, setCustomColors] = useState({ primary: '#4361ee', secondary: '#1a1a2e', accent: '#6c8cff', bg: '#ffffff', text: '#0f172a' });
  const [stickyHeader, setStickyHeader] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [bgPattern, setBgPattern] = useState('none');
  const [entranceAnim, setEntranceAnim] = useState('fade-up');
  const [favicon, setFavicon] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [beforeAfter, setBeforeAfter] = useState<BeforeAfterItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [areaServed, setAreaServed] = useState<string[]>([]);
  const [parkingInfo, setParkingInfo] = useState('');
  const [accessibilityInfo, setAccessibilityInfo] = useState('');
  const [petFriendly, setPetFriendly] = useState(false);
  const [familyFriendly, setFamilyFriendly] = useState(false);
  const [childLocations, setChildLocations] = useState<string[]>([]);

  const loadSite = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/sites/${id}`);
      if (res.ok) {
        const site = await res.json();
        if (site.data) {
          setData(site.data);
          if (site.data.aiAbout) setAiAbout(site.data.aiAbout);
          if (site.data.aiTagline) setAiTagline(site.data.aiTagline);
          if (site.data.sentiment) setSentiment(site.data.sentiment);
          if (site.data.faqs?.length) setFaqs(site.data.faqs);
          if (site.data.teamMembers?.length) setTeamMembers(site.data.teamMembers);
          if (site.data.promotions?.length) setPromotions(site.data.promotions);
          if (site.data.certifications?.length) setCertifications(site.data.certifications);
          if (site.data.beforeAfter?.length) setBeforeAfter(site.data.beforeAfter);
          if (site.data.testimonials?.length) setTestimonials(site.data.testimonials);
          if (site.data.areaServed?.length) setAreaServed(site.data.areaServed);
          if (site.data.parkingInfo) setParkingInfo(site.data.parkingInfo);
          if (site.data.accessibilityInfo) setAccessibilityInfo(site.data.accessibilityInfo);
          if (site.data.petFriendly) setPetFriendly(site.data.petFriendly);
          if (site.data.familyFriendly) setFamilyFriendly(site.data.familyFriendly);
          if (site.data.childLocations?.length) setChildLocations(site.data.childLocations);
        }
        if (site.theme) setSelectedTheme(site.theme);
        if (site.sectionOrder) setSectionOrder(site.sectionOrder);
        if (site.sections) setSections(site.sections);
        if (site.fontPairing) setFontPairing(site.fontPairing);
        if (site.customColors) setCustomColors(site.customColors);
        if (site.stickyHeader !== null && site.stickyHeader !== undefined) setStickyHeader(site.stickyHeader);
        if (site.darkMode !== null && site.darkMode !== undefined) setDarkMode(site.darkMode);
        if (site.bgPattern) setBgPattern(site.bgPattern);
        if (site.entranceAnim) setEntranceAnim(site.entranceAnim);
        if (site.favicon) setFavicon(site.favicon);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    const stored = sessionStorage.getItem('scrapedData');
    if (stored) { try { setData(JSON.parse(stored)); sessionStorage.removeItem('scrapedData'); } catch {} }
    if (siteId) loadSite(siteId);
  }, [siteId, status, router, loadSite]);

  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => setAuthTimeout(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Auto-generate AI content when data loads
  useEffect(() => {
    if (!data.name) return;
    if (!aiAbout) setAiAbout(rewriteAboutUs(data as never));
    if (!aiTagline) setAiTagline(generateTagline(data as never));
    if (!sentiment) setSentiment(analyzeSentiment(data as never));
    if (faqs.length === 0) setFaqs(generateFAQ(data as never));
    if (!favicon) setFavicon(generateFaviconSVG((data.name as string) || 'B', customColors.primary));
  }, [data]);

  const handleSave = async (asDraft = true) => {
    setSaving(true);
    try {
      const body = {
        data: { ...data, aiAbout, aiTagline, sentiment, faqs, teamMembers, promotions, certifications, beforeAfter, testimonials, areaServed, parkingInfo, accessibilityInfo, petFriendly, familyFriendly, childLocations },
        theme: selectedTheme,
        status: asDraft ? 'draft' : 'published',
        sectionOrder, sections, fontPairing, customColors, stickyHeader, darkMode, bgPattern, entranceAnim, favicon,
      };
      if (siteId) {
        const res = await fetch(`/api/sites/${siteId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Failed to save');
      } else {
        const res = await fetch('/api/sites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Failed to create site');
        const site = await res.json();
        if (site.id) router.replace(`/editor?id=${site.id}`);
      }
    } catch { /* save failed */ } finally { setSaving(false); }
  };

  const handlePublish = async () => {
    if (!siteId) { await handleSave(false); return; }
    setPublishing(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/publish`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to publish');
    } catch { /* publish failed */ } finally { setPublishing(false); }
  };

  const handleAI = async (endpoint: string) => {
    const res = await fetch(`/api/ai/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) });
    return res.json();
  };

  const moveSection = (from: number, to: number) => {
    const order = [...sectionOrder];
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    setSectionOrder(order);
  };

  const updateColor = (key: string, val: string) => setCustomColors(prev => ({ ...prev, [key]: val }));

  if (status === 'loading' && !authTimeout) return <div className="h-screen flex items-center justify-center bg-surface-dim"><div className="animate-spin h-8 w-8 border-4 border-blue border-t-transparent rounded-full" /></div>;

  const font = FONT_PAIRINGS.find(f => f.id === fontPairing) || FONT_PAIRINGS[0];
  const pattern = BACKGROUND_PATTERNS.find(p => p.id === bgPattern) || BACKGROUND_PATTERNS[0];

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`} style={{ '--c-primary': customColors.primary, '--c-secondary': customColors.secondary, '--c-accent': customColors.accent, '--c-bg': customColors.bg, '--c-text': customColors.text } as React.CSSProperties}>
      <header className={`h-14 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0 ${stickyHeader ? 'sticky top-0 z-30' : ''}`}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-surface-dim transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></Link>
          <div className="w-px h-6 bg-border" />
          <h1 className="font-semibold">Edit Site</h1>
        </div>
        <div className="flex items-center gap-3">
          <AppDarkModeToggle />
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-surface-dim transition-colors">{darkMode ? '☀️' : '🌙'}</button>
          <div className="flex items-center gap-1 bg-surface-dim rounded-lg p-1">
            <button onClick={() => setMobilePreview(false)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!mobilePreview ? 'bg-surface shadow-sm' : 'text-text-secondary'}`}>Desktop</button>
            <button onClick={() => setMobilePreview(true)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mobilePreview ? 'bg-surface shadow-sm' : 'text-text-secondary'}`}>Mobile</button>
          </div>
          <button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-surface-dim transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save Draft'}</button>
          <button onClick={handlePublish} disabled={publishing} className="px-4 py-2 gradient-blue text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">{publishing ? 'Publishing...' : 'Publish'}</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-96 bg-surface border-r border-border flex flex-col shrink-0">
          {siteId && <PageManager siteId={siteId} pages={[]} currentPageId={null} onPagesChange={() => {}} onPageSelect={() => {}} />}
          <div className="flex border-b border-border overflow-x-auto">
            {(['content', 'ai', 'sections', 'theme', 'design', 'extras'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-3 text-xs font-medium capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'text-blue border-b-2 border-blue' : 'text-text-secondary hover:text-text-primary'}`}>{tab}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <>
                <InputField label="Business Name" value={data.name as string || ''} onChange={v => setData(p => ({ ...p, name: v }))} />
                <InputField label="Category" value={data.category as string || ''} onChange={v => setData(p => ({ ...p, category: v }))} />
                <TextareaField label="Description" value={data.description as string || ''} onChange={v => setData(p => ({ ...p, description: v }))} />
                <InputField label="Phone" value={data.phone as string || ''} onChange={v => setData(p => ({ ...p, phone: v }))} />
                <InputField label="Address" value={data.address as string || ''} onChange={v => setData(p => ({ ...p, address: v }))} />
                <InputField label="Website" value={data.website as string || ''} onChange={v => setData(p => ({ ...p, website: v }))} />

                {/* Photo Management */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Photos ({((data.images as string[]) || []).length})</label>
                  <p className="text-xs text-text-secondary">Drag to reorder, click × to remove</p>
                  <div className="grid grid-cols-3 gap-2">
                    {((data.images as string[]) || []).map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-surface-dim group cursor-move"
                        draggable
                        onDragStart={() => setDragIdx(i)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => {
                          if (dragIdx !== null && dragIdx !== i) {
                            const imgs = [...(data.images as string[])];
                            const [moved] = imgs.splice(dragIdx, 1);
                            imgs.splice(i, 0, moved);
                            setData(p => ({ ...p, images: imgs }));
                          }
                          setDragIdx(null);
                        }}
                      >
                        <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            const imgs = (data.images as string[]).filter((_, j) => j !== i);
                            setData(p => ({ ...p, images: imgs }));
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">#{i + 1}</div>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-blue cursor-pointer transition-colors text-sm text-text-secondary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const base64 = reader.result as string;
                          const imgs = [...(data.images as string[] || []), base64];
                          setData(p => ({ ...p, images: imgs }));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </>
            )}

            {/* AI TAB */}
            {activeTab === 'ai' && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">AI About Us</label>
                    <button onClick={async () => { const r = await handleAI('rewrite'); setAiAbout(r.text); }} className="text-xs text-blue hover:underline">Regenerate</button>
                  </div>
                  <textarea value={aiAbout} onChange={e => setAiAbout(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-blue outline-none resize-none" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">AI Tagline</label>
                    <button onClick={async () => { const r = await handleAI('tagline'); setAiTagline(r.tagline); }} className="text-xs text-blue hover:underline">Regenerate</button>
                  </div>
                  <input value={aiTagline} onChange={e => setAiTagline(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-blue outline-none" />
                </div>
                {sentiment && (
                  <div className="p-3 rounded-xl bg-surface-dim space-y-2">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium">Sentiment</span><span className={`text-xs px-2 py-0.5 rounded-full ${sentiment.overall === 'positive' ? 'bg-green/10 text-green' : sentiment.overall === 'negative' ? 'bg-red/10 text-red' : 'bg-yellow/10 text-yellow'}`}>{sentiment.overall}</span></div>
                    <div className="flex gap-1">{sentiment.highlights.slice(0, 6).map(h => <span key={h} className="px-2 py-0.5 rounded-full bg-blue/10 text-blue text-xs">{h}</span>)}</div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-Generated FAQ ({faqs.length} items)</label>
                  {faqs.map((f, i) => <div key={i} className="p-2 rounded-lg bg-surface-dim text-xs"><p className="font-medium">{f.question}</p><p className="text-text-secondary mt-1">{f.answer}</p></div>)}
                </div>
              </>
            )}

            {/* SECTIONS TAB - Reorder */}
            {activeTab === 'sections' && (
              <div className="space-y-2">
                <p className="text-xs text-text-secondary mb-2">Drag to reorder, toggle to show/hide</p>
                {sectionOrder.map((id, idx) => {
                  const sec = ALL_SECTIONS.find(s => s.id === id);
                  if (!sec) return null;
                  return (
                    <div key={id} draggable onDragStart={() => setSectionDragIdx(idx)} onDragOver={e => e.preventDefault()} onDrop={() => { if (sectionDragIdx !== null) moveSection(sectionDragIdx, idx); setSectionDragIdx(null); }} className={`flex items-center justify-between p-3 rounded-xl border border-border hover:bg-surface-dim transition-colors cursor-move ${sectionDragIdx === idx ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-2"><span className="text-lg">{sec.icon}</span><span className="text-sm font-medium">{sec.name}</span></div>
                      <button onClick={() => setSections(p => ({ ...p, [id]: !p[id] }))} className={`relative w-10 h-6 rounded-full transition-colors ${sections[id] ? 'bg-blue' : 'bg-surface-dimmer'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${sections[id] ? 'left-5' : 'left-1'}`} /></button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* THEME TAB */}
            {activeTab === 'theme' && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Color Theme</label>
                  {[{ id: 'modern-light', name: 'Modern Light', c: ['#ffffff', '#1a1a2e', '#4361ee'] }, { id: 'modern-dark', name: 'Modern Dark', c: ['#1a1a2e', '#ffffff', '#4361ee'] }, { id: 'clean-white', name: 'Clean White', c: ['#ffffff', '#0f172a', '#10b981'] }, { id: 'warm-earth', name: 'Warm Earthy', c: ['#f5f0eb', '#8b5e3c', '#d4a574'] }, { id: 'bold-accent', name: 'Bold Accent', c: ['#ffffff', '#0f0f0f', '#8b5cf6'] }].map(t => (
                    <button key={t.id} onClick={() => setSelectedTheme(t.id)} className={`w-full p-3 rounded-xl border-2 transition-all text-left ${selectedTheme === t.id ? 'border-blue shadow-sm' : 'border-border'}`}>
                      <div className="flex items-center gap-3"><div className="flex gap-1">{t.c.map((c, i) => <div key={i} className="w-6 h-6 rounded-full border border-border/20" style={{ backgroundColor: c }} />)}</div><span className="text-sm font-medium">{t.name}</span></div>
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Font Pairing</label>
                  {FONT_PAIRINGS.map(fp => (
                    <button key={fp.id} onClick={() => setFontPairing(fp.id)} className={`w-full p-3 rounded-xl border-2 transition-all text-left ${fontPairing === fp.id ? 'border-blue shadow-sm' : 'border-border'}`}>
                      <span className="text-sm font-medium">{fp.name}</span><span className="text-xs text-text-secondary ml-2">{fp.heading} + {fp.body}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Brand Colors</label>
                  {Object.entries(customColors).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-xs text-text-secondary w-20 capitalize">{key}</label>
                      <input type="color" value={val} onChange={e => updateColor(key, e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                      <input value={val} onChange={e => updateColor(key, e.target.value)} className="flex-1 px-2 py-1 rounded border border-border text-xs font-mono" />
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Background Pattern</label>
                  {BACKGROUND_PATTERNS.map(p => (
                    <button key={p.id} onClick={() => setBgPattern(p.id)} className={`w-full p-3 rounded-xl border-2 transition-all text-left ${bgPattern === p.id ? 'border-blue shadow-sm' : 'border-border'}`}><span className="text-sm font-medium">{p.name}</span></button>
                  ))}
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Entrance Animation</label>
                  {ENTRANCE_ANIMATIONS.map(a => (
                    <button key={a.id} onClick={() => setEntranceAnim(a.id)} className={`w-full p-3 rounded-xl border-2 transition-all text-left ${entranceAnim === a.id ? 'border-blue shadow-sm' : 'border-border'}`}><span className="text-sm font-medium">{a.name}</span></button>
                  ))}
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <span className="text-sm font-medium">Sticky Header</span>
                  <button onClick={() => setStickyHeader(!stickyHeader)} className={`relative w-10 h-6 rounded-full transition-colors ${stickyHeader ? 'bg-blue' : 'bg-surface-dimmer'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${stickyHeader ? 'left-5' : 'left-1'}`} /></button>
                </div>
              </>
            )}

            {/* EXTRAS TAB */}
            {activeTab === 'extras' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo</label>
                  <div className="flex items-center gap-3">
                    {(data.logo as string) ? (
                      <div className="relative group">
                        <img src={data.logo as string} alt="Logo" className="w-16 h-16 rounded-xl object-contain bg-surface-dim border border-border" />
                        <button
                          onClick={() => setData(p => { const d = { ...p }; delete d.logo; return d; })}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-blue cursor-pointer transition-colors text-text-secondary">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setData(p => ({ ...p, logo: reader.result as string }));
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    )}
                    <div className="text-xs text-text-secondary">
                      <p>Upload your business logo</p>
                      <p>PNG, JPG, SVG (max 2MB)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Favicon</label>
                  <div className="flex items-center gap-3">
                    {favicon && <div dangerouslySetInnerHTML={{ __html: favicon }} className="w-8 h-8" />}
                    <input value={customColors.primary} onChange={e => { setCustomColors(p => ({ ...p, primary: e.target.value })); setFavicon(generateFaviconSVG((data.name as string) || 'B', e.target.value)); }} type="color" className="w-8 h-8 rounded cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Members</label>
                  {teamMembers.map((m, i) => <div key={m.id} className="p-2 rounded-lg bg-surface-dim text-xs flex justify-between"><span>{m.name} - {m.role}</span><button onClick={() => setTeamMembers(p => p.filter((_, j) => j !== i))} className="text-red">×</button></div>)}
                  <button onClick={() => setTeamMembers(p => [...p, { id: Date.now().toString(), name: 'New Member', role: 'Staff', bio: '', photo: '' }])} className="text-xs text-blue hover:underline">+ Add Member</button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Promotions</label>
                  {promotions.map((p, i) => <div key={p.id} className="p-2 rounded-lg bg-surface-dim text-xs flex justify-between"><span>{p.title}</span><button onClick={() => setPromotions(pr => pr.filter((_, j) => j !== i))} className="text-red">×</button></div>)}
                  <button onClick={() => setPromotions(p => [...p, { id: Date.now().toString(), title: 'New Promotion', description: '', expiryDate: '', active: true }])} className="text-xs text-blue hover:underline">+ Add Promotion</button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Certifications</label>
                  {certifications.map((c, i) => <div key={c.id} className="p-2 rounded-lg bg-surface-dim text-xs flex justify-between"><span>{c.name}</span><button onClick={() => setCertifications(cr => cr.filter((_, j) => j !== i))} className="text-red">×</button></div>)}
                  <button onClick={() => setCertifications(c => [...c, { id: Date.now().toString(), name: 'New Certification', issuer: '', year: '', icon: '🏆' }])} className="text-xs text-blue hover:underline">+ Add Certification</button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Testimonials</label>
                  {testimonials.map((t, i) => <div key={t.id} className="p-2 rounded-lg bg-surface-dim text-xs flex justify-between"><span>{t.name}: {t.text.slice(0, 30)}...</span><button onClick={() => setTestimonials(tr => tr.filter((_, j) => j !== i))} className="text-red">×</button></div>)}
                  <button onClick={() => setTestimonials(t => [...t, { id: Date.now().toString(), name: 'Customer', text: 'Great experience!', rating: 5, source: 'Google' }])} className="text-xs text-blue hover:underline">+ Add Testimonial</button>
                </div>
                <InputField label="Parking Info" value={parkingInfo} onChange={setParkingInfo} />
                <InputField label="Accessibility Info" value={accessibilityInfo} onChange={setAccessibilityInfo} />
                <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <span className="text-sm font-medium">Pet Friendly</span>
                  <button onClick={() => setPetFriendly(!petFriendly)} className={`relative w-10 h-6 rounded-full transition-colors ${petFriendly ? 'bg-blue' : 'bg-surface-dimmer'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${petFriendly ? 'left-5' : 'left-1'}`} /></button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <span className="text-sm font-medium">Family Friendly</span>
                  <button onClick={() => setFamilyFriendly(!familyFriendly)} className={`relative w-10 h-6 rounded-full transition-colors ${familyFriendly ? 'bg-blue' : 'bg-surface-dimmer'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${familyFriendly ? 'left-5' : 'left-1'}`} /></button>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* PREVIEW */}
        <div className="flex-1 flex items-center justify-center p-8 bg-surface-dimmer overflow-auto">
          <div className={`bg-surface rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${mobilePreview ? 'w-[375px]' : 'w-full max-w-4xl'}`} style={{ fontFamily: font.css }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-dim">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
              <div className="flex-1 text-center"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface text-xs text-text-secondary">{(data.name as string) || 'Business'}.mapody.site</div></div>
            </div>
            <div className="aspect-[4/3] overflow-y-auto">
              {sectionOrder.map(id => {
                if (!sections[id]) return null;
                return <PreviewSection key={id} id={id} data={data} aiAbout={aiAbout} aiTagline={aiTagline} sentiment={sentiment} faqs={faqs} teamMembers={teamMembers} promotions={promotions} certifications={certifications} beforeAfter={beforeAfter} testimonials={testimonials} areaServed={areaServed} parkingInfo={parkingInfo} accessibilityInfo={accessibilityInfo} petFriendly={petFriendly} familyFriendly={familyFriendly} childLocations={childLocations} customColors={customColors} darkMode={darkMode} entranceAnim={entranceAnim} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div><label className="block text-sm font-medium mb-1.5">{label}</label><input value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-blue outline-none" /></div>;
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div><label className="block text-sm font-medium mb-1.5">{label}</label><textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-blue outline-none resize-none" /></div>;
}

function PreviewSection({ id, data, aiAbout, aiTagline, sentiment, faqs, teamMembers, promotions, certifications, beforeAfter, testimonials, areaServed, parkingInfo, accessibilityInfo, petFriendly, familyFriendly, childLocations, customColors, darkMode, entranceAnim }: {
  id: string; data: Record<string, unknown>; aiAbout: string; aiTagline: string;
  sentiment: { overall: string; highlights: string[] } | null; faqs: Array<{ question: string; answer: string }>;
  teamMembers: TeamMember[]; promotions: Promotion[]; certifications: Certification[];
  beforeAfter: BeforeAfterItem[]; testimonials: Testimonial[];
  areaServed: string[]; parkingInfo: string; accessibilityInfo: string;
  petFriendly: boolean; familyFriendly: boolean; childLocations: string[];
  customColors: Record<string, string>; darkMode: boolean; entranceAnim: string;
}) {
  const name = (data.name as string) || 'Business';
  const cat = (data.category as string) || '';
  const addr = (data.address as string) || '';
  const phone = (data.phone as string) || '';
  const desc = (data.description as string) || '';
  const rating = (data.rating as number) || 0;
  const totalReviews = (data.totalReviews as number) || 0;
  const hours = (data.openingHours as Record<string, string>) || {};
  const images = (data.images as string[]) || [];
  const reviews = (data.reviews as Array<{ authorName?: string; rating?: number; text?: string }>) || [];
  const animStyle = entranceAnim !== 'none' ? { animation: `${entranceAnim} 0.6s ease-out forwards` } : {};

  const bg = darkMode ? '#1a1a2e' : customColors.bg;
  const txt = darkMode ? '#f1f5f9' : customColors.text;

  switch (id) {
    case 'hero': return <div key={id} style={{ ...animStyle, background: `linear-gradient(135deg, ${customColors.secondary}, ${customColors.primary})` }} className="p-8 text-center text-white"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs mb-4"><span className="w-2 h-2 bg-green-400 rounded-full" />Open Now</div><h2 className="text-3xl font-bold mb-2">{name}</h2><p className="text-white/70 text-sm mb-1">{cat}</p>{aiTagline && <p className="text-white/90 text-lg italic mb-4">{aiTagline}</p>}<div className="flex gap-3 justify-center">{phone && <a href={`tel:${phone}`} className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium">📞 Call Now</a>}<button className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">Directions</button></div></div>;
    case 'tagline': return aiTagline ? <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-6 text-center"><p className="text-xl italic font-medium" style={{ color: customColors.primary }}>{aiTagline}</p></div> : null;
    case 'about': return <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">About Us</h3><p className="text-sm leading-relaxed opacity-80">{aiAbout || desc || 'Business description will appear here.'}</p></div>;
    case 'sentiment': return sentiment && sentiment.highlights.length > 0 ? <div key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">What Customers Love</h3><div className="flex flex-wrap gap-2">{sentiment.highlights.map(h => <span key={h} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: `${customColors.primary}20`, color: customColors.primary }}>{h}</span>)}</div></div> : null;
    case 'hours': return Object.keys(hours).length > 0 ? <div key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">Hours</h3><div className="space-y-2 text-sm">{Object.entries(hours).map(([day, h]) => <div key={day} className="flex justify-between"><span className="opacity-70">{day}</span><span>{h}</span></div>)}</div></div> : null;
    case 'gallery': return <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">Gallery</h3><div className="grid grid-cols-3 gap-2">{images.slice(0, 6).map((img, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden bg-surface-dimmer"><img src={img} alt={`${name} photo ${i + 1}`} className="w-full h-full object-cover" /></div>)}{images.length === 0 && [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-surface-dimmer rounded-lg" />)}</div></div>;
    case 'reviews': return <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">Reviews</h3><div className="flex items-center gap-2 mb-4"><span className="text-2xl font-bold">{rating}</span><div className="flex text-yellow">★★★★★</div><span className="opacity-60 text-sm">({totalReviews})</span></div><div className="space-y-3">{reviews.slice(0, 3).map((r, i) => <div key={i} className="p-3 rounded-xl" style={{ background: darkMode ? '#0f172a' : '#f8fafc' }}><div className="flex items-center gap-2 mb-1"><span className="font-medium text-sm">{r.authorName}</span><span className="text-yellow text-xs">{'★'.repeat(r.rating || 0)}</span></div><p className="opacity-70 text-sm">{r.text}</p></div>)}</div></div>;
    case 'services': return (data.services as string[])?.length ? <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">Services</h3><div className="grid grid-cols-2 gap-2">{(data.services as string[]).map((s, i) => <div key={i} className="p-3 rounded-xl text-sm" style={{ background: `${customColors.primary}10` }}>{s}</div>)}</div></div> : null;
    case 'faq': return faqs.length > 0 ? <div key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">Frequently Asked Questions</h3><div className="space-y-3">{faqs.map((f, i) => <div key={i} className="p-4 rounded-xl" style={{ background: darkMode ? '#0f172a' : '#ffffff' }}><p className="font-medium text-sm mb-1">{f.question}</p><p className="text-sm opacity-70">{f.answer}</p></div>)}</div></div> : null;
    case 'promos': return promotions.length > 0 ? <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">🎉 Specials & Promotions</h3><div className="space-y-3">{promotions.filter(p => p.active).map(p => <div key={p.id} className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: customColors.primary }}><p className="font-medium">{p.title}</p><p className="text-sm opacity-70 mt-1">{p.description}</p>{p.expiryDate && <p className="text-xs mt-2 opacity-50">Expires: {p.expiryDate}</p>}</div>)}</div></div> : null;
    case 'team': return teamMembers.length > 0 ? <div key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">Meet Our Team</h3><div className="grid grid-cols-3 gap-4">{teamMembers.map(m => <div key={m.id} className="text-center"><div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl font-bold" style={{ background: `${customColors.primary}20`, color: customColors.primary }}>{m.name.charAt(0)}</div><p className="font-medium text-sm">{m.name}</p><p className="text-xs opacity-60">{m.role}</p></div>)}</div></div> : null;
    case 'certs': return certifications.length > 0 ? <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">🏆 Certifications & Awards</h3><div className="flex flex-wrap gap-3">{certifications.map(c => <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${customColors.primary}10` }}><span className="text-lg">{c.icon}</span><div><p className="text-sm font-medium">{c.name}</p><p className="text-xs opacity-60">{c.issuer} {c.year}</p></div></div>)}</div></div> : null;
    case 'before-after': return beforeAfter.length > 0 ? <div key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">Before & After</h3><div className="space-y-4">{beforeAfter.map(b => <div key={b.id}><div className="grid grid-cols-2 gap-2"><div className="aspect-square bg-surface-dimmer rounded-lg overflow-hidden"><img src={b.beforeUrl} alt="Before" className="w-full h-full object-cover" /></div><div className="aspect-square bg-surface-dimmer rounded-lg overflow-hidden"><img src={b.afterUrl} alt="After" className="w-full h-full object-cover" /></div></div>{b.caption && <p className="text-sm mt-2 opacity-70 text-center">{b.caption}</p>}</div>)}</div></div> : null;
    case 'testimonials': return testimonials.length > 0 ? <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">💬 What People Say</h3><div className="space-y-3">{testimonials.map(t => <div key={t.id} className="p-4 rounded-xl" style={{ background: darkMode ? '#0f172a' : '#f8fafc' }}><div className="flex items-center gap-2 mb-2"><span className="font-medium text-sm">{t.name}</span><span className="text-yellow text-xs">{'★'.repeat(t.rating)}</span><span className="text-xs opacity-50">{t.source}</span></div><p className="text-sm opacity-70 italic">&ldquo;{t.text}&rdquo;</p></div>)}</div></div> : null;
    case 'area': return areaServed.length > 0 ? <div key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">📍 Areas We Serve</h3><div className="flex flex-wrap gap-2">{areaServed.map(a => <span key={a} className="px-3 py-1.5 rounded-full text-sm" style={{ background: `${customColors.primary}10`, color: customColors.primary }}>{a}</span>)}</div></div> : null;
    case 'parking': return (parkingInfo || accessibilityInfo || petFriendly || familyFriendly) ? <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">♿ Parking & Accessibility</h3><div className="space-y-2 text-sm">{parkingInfo && <p>🅿️ {parkingInfo}</p>}{accessibilityInfo && <p>♿ {accessibilityInfo}</p>}{petFriendly && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green/10 text-green text-xs">🐾 Pet Friendly</span>}{familyFriendly && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue/10 text-blue text-xs ml-2">👨‍👩‍👧‍👦 Family Friendly</span>}</div></div> : null;
    case 'badges': return (petFriendly || familyFriendly) ? <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-6 border-b border-border flex gap-3 justify-center">{petFriendly && <span className="px-4 py-2 rounded-full bg-green/10 text-green font-medium text-sm">🐾 Pet Friendly</span>}{familyFriendly && <span className="px-4 py-2 rounded-full bg-blue/10 text-blue font-medium text-sm">👨‍👩‍👧‍👦 Family Friendly</span>}</div> : null;
    case 'location': return <div key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">Location</h3><div className="aspect-video bg-surface-dimmer rounded-xl flex items-center justify-center mb-3"><svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg></div><p className="text-sm opacity-70">{addr}</p></div>;
    case 'contact': return <div key={id} style={{ ...animStyle, background: bg, color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">Contact</h3><div className="space-y-2 text-sm">{phone && <p>📞 {phone}</p>}{addr && <p>📍 {addr}</p>}{(data.website as string) && <p>🌐 {data.website as string}</p>}</div></div>;
    case 'contact-form': return <div key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">Contact Form</h3><div className="space-y-3 text-sm opacity-60"><div className="h-10 rounded-xl border border-border bg-surface-dim" /><div className="h-10 rounded-xl border border-border bg-surface-dim" /><div className="h-10 rounded-xl border border-border bg-surface-dim" /><div className="h-20 rounded-xl border border-border bg-surface-dim" /><div className="h-10 w-32 rounded-xl" style={{ background: customColors.primary }} /></div></div>;
    case 'multi-location': return childLocations.length > 0 ? <div key={id} style={{ ...animStyle, background: darkMode ? '#16213e' : '#f8fafc', color: txt }} className="p-8 border-b border-border"><h3 className="font-semibold text-lg mb-3">🏢 All Locations</h3><div className="grid grid-cols-2 gap-3">{childLocations.map((loc, i) => <div key={i} className="p-3 rounded-xl border border-border"><p className="font-medium text-sm">{loc}</p></div>)}</div></div> : null;
    case 'footer': return <div key={id} style={{ background: customColors.secondary }} className="p-6 text-center text-white/40 text-xs">Powered by Mapody</div>;
    default: return null;
  }
}

export default function EditorPage() {
  return <Suspense fallback={<div className="h-screen flex items-center justify-center bg-surface-dim"><div className="animate-spin h-8 w-8 border-4 border-blue border-t-transparent rounded-full" /></div>}><EditorContent /></Suspense>;
}
