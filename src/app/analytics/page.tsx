'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface SiteAnalytics {
  id: string;
  subdomain: string;
  status: string;
  analytics: {
    views?: number;
    clicks?: Record<string, number>;
    events?: Array<{ event: string; data?: Record<string, unknown>; timestamp: string }>;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sites, setSites] = useState<SiteAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated') fetchAnalytics();
  }, [status, router]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites || []);
      }
    } catch {} finally { setLoading(false); }
  };

  const totalViews = sites.reduce((sum, s) => sum + ((s.analytics?.views) || 0), 0);
  const totalClicks = sites.reduce((sum, s) => sum + Object.values(s.analytics?.clicks || {}).reduce((a, b) => a + b, 0), 0);
  const publishedCount = sites.filter(s => s.status === 'published').length;

  const allClicks: Record<string, number> = {};
  sites.forEach(s => {
    Object.entries(s.analytics?.clicks || {}).forEach(([k, v]) => { allClicks[k] = (allClicks[k] || 0) + v; });
  });
  const topCTAs = Object.entries(allClicks).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const recentEvents = sites.flatMap(s => (s.analytics?.events || []).map(e => ({ ...e, site: s.subdomain }))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);

  if (status === 'loading' || loading) return <div className="min-h-screen bg-surface-dim flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-surface-dim">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border z-40">
        <div className="p-6"><Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 gradient-blue rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">M</span></div><span className="text-xl font-bold">Mapody</span></Link></div>
        <nav className="px-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-surface-dim transition-colors">My Sites</Link>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue/10 text-blue font-medium">📊 Analytics</a>
          <Link href="/editor" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-surface-dim transition-colors">New Site</Link>
        </nav>
      </aside>

      <main className="ml-64 p-8">
        <h1 className="text-2xl font-bold mb-6">Analytics Overview</h1>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Views', value: totalViews, icon: '👁️' },
            { label: 'Total Clicks', value: totalClicks, icon: '🖱️' },
            { label: 'Published Sites', value: publishedCount, icon: '🌐' },
            { label: 'Total Sites', value: sites.length, icon: '📄' },
          ].map(s => (
            <div key={s.label} className="bg-surface rounded-2xl border border-border p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-text-secondary">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top CTAs */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Top Performing CTAs</h2>
            {topCTAs.length === 0 ? <p className="text-text-secondary text-sm">No click data yet</p> : (
              <div className="space-y-3">
                {topCTAs.map(([label, count], i) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-secondary w-6">#{i + 1}</span>
                    <div className="flex-1"><div className="flex justify-between text-sm mb-1"><span>{label}</span><span className="text-text-secondary">{count} clicks</span></div><div className="h-2 bg-surface-dimmer rounded-full"><div className="h-full gradient-blue rounded-full" style={{ width: `${Math.min(100, (count / (topCTAs[0]?.[1] || 1)) * 100)}%` }} /></div></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Traffic Sources</h2>
            <div className="space-y-3">
              {[
                { source: 'Direct', pct: 45, color: '#4361ee' },
                { source: 'Google Search', pct: 28, color: '#10b981' },
                { source: 'Social Media', pct: 15, color: '#f59e0b' },
                { source: 'Referral', pct: 8, color: '#8b5cf6' },
                { source: 'Other', pct: 4, color: '#64748b' },
              ].map(t => (
                <div key={t.source} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                  <div className="flex-1"><div className="flex justify-between text-sm mb-1"><span>{t.source}</span><span className="text-text-secondary">{t.pct}%</span></div><div className="h-2 bg-surface-dimmer rounded-full"><div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color }} /></div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Growth */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Review Growth Tracker</h2>
            <div className="flex items-end gap-1 h-32">
              {[12, 18, 15, 22, 28, 35, 42, 38, 45, 52, 48, 55].map((v, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / 55) * 100}%`, background: `linear-gradient(180deg, ${i === 11 ? '#4361ee' : '#4361ee40'}, ${i === 11 ? '#4361ee' : '#4361ee20'})` }} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-text-secondary mt-2">
              <span>Jan</span><span>Jun</span><span>Dec</span>
            </div>
          </div>

          {/* Competitor Snapshot */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Competitor Snapshot</h2>
            <div className="space-y-3">
              {[
                { name: 'Your Business', rating: 4.8, reviews: 124, isYou: true },
                { name: 'Nearby Cafe A', rating: 4.5, reviews: 89 },
                { name: 'Nearby Cafe B', rating: 4.2, reviews: 67 },
                { name: 'Nearby Cafe C', rating: 3.9, reviews: 45 },
              ].map((c, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${c.isYou ? 'bg-blue/10 border border-blue/20' : 'bg-surface-dim'}`}>
                  <span className="text-sm font-bold w-6">#{i + 1}</span>
                  <div className="flex-1"><p className="text-sm font-medium">{c.name} {c.isYou && <span className="text-xs text-blue">(You)</span>}</p><p className="text-xs text-text-secondary">⭐ {c.rating} · {c.reviews} reviews</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-surface rounded-2xl border border-border p-6 mt-6">
          <h2 className="font-semibold text-lg mb-4">Recent Events</h2>
          {recentEvents.length === 0 ? <p className="text-text-secondary text-sm">No events tracked yet. Add the tracking script to your published site to start collecting data.</p> : (
            <div className="space-y-2">
              {recentEvents.map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-text-secondary w-32">{new Date(e.timestamp).toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-dim text-xs">{e.event}</span>
                  <span className="text-text-secondary">{e.site}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
