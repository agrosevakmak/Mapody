'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { isValidGoogleMapsUrl } from '@/lib/apify';
import CreditsBadge from '@/components/CreditsBadge';
import { AppDarkModeToggle } from '@/components/AppDarkModeToggle';

interface Site {
  id: string;
  name: string;
  subdomain: string;
  status: 'draft' | 'published';
  createdAt: string;
}

const navItems = {
  main: [
    { id: 'sites', label: 'My Sites', href: '/dashboard', icon: 'grid' },
    { id: 'analytics', label: 'Analytics', href: '/analytics', icon: 'bar-chart' },
  ],
  tools: [
    { id: 'bulk-import', label: 'Bulk Import', href: null, icon: 'upload' },
  ],
  account: [
    { id: 'settings', label: 'Settings', href: '/settings', icon: 'gear' },
    { id: 'pricing', label: 'Pricing', href: '/pricing', icon: 'diamond' },
    { id: 'support', label: 'Support', href: '/support', icon: 'lifebuoy' },
  ],
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const cls = className ?? 'w-5 h-5';
  switch (name) {
    case 'grid':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      );
    case 'bar-chart':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case 'upload':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      );
    case 'gear':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'diamond':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      );
    case 'lifebuoy':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      );
    case 'plus':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    case 'collapse':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      );
    case 'external-link':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      );
    case 'copy':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
        </svg>
      );
    case 'trash':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      );
    case 'globe':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('sites');
  const [showNewSiteModal, setShowNewSiteModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState('');
  const [authTimeout, setAuthTimeout] = useState(false);
  const [deletingSite, setDeletingSite] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => setAuthTimeout(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch('/api/sites');
      if (res.ok) {
        const data = await res.json();
        setSites(data);
      }
    } catch {
      // fetch failed silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated' || authTimeout) {
      fetchSites();
    }
  }, [status, router, authTimeout, fetchSites]);

  const handleCreateSite = async () => {
    if (!newUrl.trim()) {
      setError('Please enter a Google Maps URL');
      return;
    }
    if (!isValidGoogleMapsUrl(newUrl)) {
      setError('Please provide a valid Google Maps URL or shareable link');
      return;
    }
    setScraping(true);
    setError('');
    try {
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl }),
      });
      const scrapeData = await scrapeRes.json();
      if (!scrapeRes.ok) {
        setError(scrapeData.error || 'Failed to scrape business data');
        return;
      }
      const siteRes = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: scrapeData }),
      });
      const siteData = await siteRes.json();
      if (!siteRes.ok) {
        setError(siteData.error || 'Failed to create site');
        return;
      }
      setShowNewSiteModal(false);
      setNewUrl('');
      sessionStorage.setItem('scrapedData', JSON.stringify(scrapeData));
      router.push(`/editor?id=${siteData.id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setScraping(false);
    }
  };

  const handleBulkImport = async () => {
    const urls = bulkUrls.split('\n').map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0) return;
    setBulkImporting(true);
    setBulkError('');
    try {
      const res = await fetch('/api/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowBulkImport(false);
        setBulkUrls('');
        fetchSites();
      } else {
        setBulkError(data.error || 'Import failed');
      }
    } catch {
      setBulkError('Network error. Please try again.');
    } finally {
      setBulkImporting(false);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Delete this site? This action cannot be undone.')) return;
    setDeletingSite(siteId);
    try {
      await fetch(`/api/sites/${siteId}`, { method: 'DELETE' });
      fetchSites();
    } catch {
      // failed silently
    } finally {
      setDeletingSite(null);
    }
  };

  const handleDuplicateSite = async (siteId: string) => {
    if (!confirm('Duplicate this site?')) return;
    try {
      const res = await fetch(`/api/sites/${siteId}/duplicate`, { method: 'POST' });
      if (res.ok) fetchSites();
    } catch {
      // failed silently
    }
  };

  if ((status === 'loading' && !authTimeout) || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-dim)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--blue)', animation: 'spin 0.8s linear infinite' }} />
            <div className="absolute inset-1 rounded-full border-2 border-transparent" style={{ borderBottomColor: 'var(--blue)', opacity: 0.4, animation: 'spin 1.2s linear infinite reverse' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const bulkUrlCount = bulkUrls.split('\n').filter((u) => u.trim()).length;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-dim)' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .nav-item-active { background: color-mix(in srgb, var(--blue) 12%, transparent); color: var(--blue); box-shadow: inset 3px 0 0 var(--blue), 0 0 20px color-mix(in srgb, var(--blue) 8%, transparent); }
        .site-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
        .site-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .modal-overlay { animation: fadeIn 0.15s ease-out; }
        .modal-card { animation: scaleIn 0.2s ease-out; }
        .sidebar-transition { transition: width 0.2s ease, padding 0.2s ease; }
        .nav-label { transition: opacity 0.15s ease; }
      `}</style>

      {/* Sidebar */}
      <aside
        className="sidebar-transition fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r"
        style={{
          width: sidebarCollapsed ? 64 : 260,
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 gradient-blue rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {!sidebarCollapsed && (
              <span className="nav-label text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Mapody
              </span>
            )}
          </Link>
        </div>

        {/* Collapse toggle */}
        <div className="px-3 mb-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-dim)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <NavIcon name={sidebarCollapsed ? 'chevron-right' : 'collapse'} className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {Object.entries(navItems).map(([section, items]) => (
            <div key={section}>
              {!sidebarCollapsed && (
                <p className="nav-label px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                  {section}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = activeNav === item.id;
                  const content = (
                    <>
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'nav-item-active' : ''}`}
                        style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--surface-dim)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; if (!isActive) e.currentTarget.style.color = ''; }}
                      >
                        <NavIcon name={item.icon} className="w-[18px] h-[18px] shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="nav-label truncate">{item.label}</span>
                        )}
                      </div>
                    </>
                  );

                  if (item.id === 'bulk-import') {
                    return (
                      <button key={item.id} onClick={() => setShowBulkImport(true)} className="w-full text-left">
                        {content}
                      </button>
                    );
                  }
                  return (
                    <Link key={item.id} href={item.href as string} onClick={() => setActiveNav(item.id)}>
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="shrink-0 border-t p-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 px-2 py-2 min-w-0">
            <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center shrink-0 text-white font-semibold text-xs">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="nav-label min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="nav-label px-1 mt-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide" style={{ background: 'color-mix(in srgb, var(--blue) 12%, transparent)', color: 'var(--blue)' }}>
                Free Plan
              </span>
            </div>
          )}

          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-dim)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              {!sidebarCollapsed && <span className="nav-label">Sign Out</span>}
            </button>
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={async () => {
                if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
                if (!confirm('This will permanently delete all your sites and data. Continue?')) return;
                const res = await fetch('/api/user/delete', { method: 'DELETE' });
                if (res.ok) signOut({ callbackUrl: '/' });
              }}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg border text-xs font-medium mt-1.5 transition-colors"
              style={{ borderColor: 'color-mix(in srgb, var(--error) 30%, transparent)', color: 'var(--error)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--error) 8%, transparent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              <span className="nav-label">Delete Account</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="sidebar-transition flex-1 min-w-0" style={{ marginLeft: sidebarCollapsed ? 64 : 260 }}>
        {/* Header */}
        <header className="sticky top-0 z-30 border-b" style={{ background: 'color-mix(in srgb, var(--surface-dim) 85%, transparent)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-8 h-16">
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Sites</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {sites.length} site{sites.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CreditsBadge />
              <AppDarkModeToggle />
              <button
                onClick={() => setShowNewSiteModal(true)}
                className="gradient-blue text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <NavIcon name="plus" className="w-4 h-4" />
                New Site
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24" style={{ animation: 'slideUp 0.4s ease-out' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'var(--surface-dimmer)' }}>
                <NavIcon name="globe" className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No sites yet</h3>
              <p className="text-sm mb-6 text-center max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                Create your first website by pasting a Google Maps link. It takes less than a minute.
              </p>
              <button
                onClick={() => setShowNewSiteModal(true)}
                className="gradient-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <NavIcon name="plus" className="w-4 h-4" />
                Create Your First Site
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sites.map((site, i) => (
                <div
                  key={site.id}
                  className="site-card rounded-xl border overflow-hidden"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    animation: `slideUp 0.3s ease-out ${i * 0.05}s both`,
                  }}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--surface-dim), var(--surface-dimmer))' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <span className="text-xl font-bold" style={{ color: 'var(--blue)' }}>
                          {site.name?.charAt(0)?.toUpperCase() || site.subdomain?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                      </div>
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={site.status === 'published'
                          ? { background: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)' }
                          : { background: 'color-mix(in srgb, var(--warning) 15%, transparent)', color: 'var(--warning)' }
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: site.status === 'published' ? 'var(--success)' : 'var(--warning)' }} />
                        {site.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>
                      {site.subdomain}
                    </h3>
                    <p className="text-xs truncate mb-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {site.subdomain}.mapody.site
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => router.push(`/editor?id=${site.id}`)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-dim)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => window.open(`/preview/${site.id}`, '_blank')}
                        className="py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-dim)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        title="Preview"
                      >
                        <NavIcon name="external-link" className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateSite(site.id)}
                        className="py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-dim)'; e.currentTarget.style.color = 'var(--blue)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        title="Duplicate"
                      >
                        <NavIcon name="copy" className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSite(site.id)}
                        disabled={deletingSite === site.id}
                        className="py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-40"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => { if (deletingSite !== site.id) { e.currentTarget.style.background = 'color-mix(in srgb, var(--error) 8%, transparent)'; e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--error) 30%, transparent)'; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        title="Delete"
                      >
                        <NavIcon name="trash" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Site Modal */}
      {showNewSiteModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <div
            className="modal-card w-full max-w-lg rounded-2xl p-6 shadow-2xl relative"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {/* Gradient border accent */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--blue) 20%, transparent), transparent 60%)', padding: '1px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />

            <div className="flex items-center justify-between mb-5 relative">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Create New Site</h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Paste a Google Maps business URL</p>
              </div>
              <button
                onClick={() => { setShowNewSiteModal(false); setError(''); setNewUrl(''); }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-dim)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 relative">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Google Maps URL</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                    <NavIcon name="globe" className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => { setNewUrl(e.target.value); setError(''); }}
                    placeholder="https://www.google.com/maps/place/..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                    style={{ background: 'var(--surface-dim)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = `0 0 0 3px color-mix(in srgb, var(--blue) 15%, transparent)`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreateSite(); }}
                  />
                </div>
                {error && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--error)' }}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {error}
                  </p>
                )}
              </div>
              <button
                onClick={handleCreateSite}
                disabled={scraping || !newUrl.trim()}
                className="w-full py-2.5 gradient-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {scraping ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate Website'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <div
            className="modal-card w-full max-w-lg rounded-2xl p-6 shadow-2xl relative"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--blue) 20%, transparent), transparent 60%)', padding: '1px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />

            <div className="flex items-center justify-between mb-5 relative">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Bulk Import Sites</h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Import multiple sites at once (max 50)</p>
              </div>
              <button
                onClick={() => { setShowBulkImport(false); setBulkUrls(''); }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-dim)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 relative">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Google Maps URLs (one per line)</label>
                <textarea
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  rows={8}
                  placeholder={"https://www.google.com/maps/place/Place1\nhttps://www.google.com/maps/place/Place2\nhttps://goo.gl/maps/abc123"}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-mono resize-none"
                  style={{ background: 'var(--surface-dim)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = `0 0 0 3px color-mix(in srgb, var(--blue) 15%, transparent)`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {bulkImporting && (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'color-mix(in srgb, var(--blue) 8%, transparent)' }}>
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--blue)', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--blue)' }}>Importing sites...</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>This may take a few minutes</p>
                  </div>
                </div>
              )}
              {bulkError && (
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--error)' }}>{bulkError}</p>
              )}

              <button
                onClick={handleBulkImport}
                disabled={bulkImporting || !bulkUrls.trim()}
                className="w-full py-2.5 gradient-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bulkImporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Importing...
                  </>
                ) : (
                  `Import ${bulkUrlCount} Site${bulkUrlCount !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
