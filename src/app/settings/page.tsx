'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  company: string;
  location: string;
  avatar: string;
  plan: string;
  credits: number;
  preferences: {
    darkMode: boolean;
    emailNotifications: boolean;
    defaultTheme: string;
    layoutDensity: string;
    fontSize: string;
    language: string;
  };
}

interface Credits {
  plan: string;
  credits: number;
  limit: number;
  nextResetAt: string | null;
}

type TabId = 'profile' | 'password' | 'preferences' | 'plan' | 'danger';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: '/support' },
];

const tabs: { id: TabId; label: string; icon: React.ReactNode; danger?: boolean }[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: 'password',
    label: 'Password',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    danger: true,
  },
];

const themes = [
  { id: 'modern-light', label: 'Modern Light' },
  { id: 'modern-dark', label: 'Modern Dark' },
  { id: 'classic', label: 'Classic' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

const fontSizes = ['S', 'M', 'L', 'XL'] as const;
const densities = ['compact', 'comfortable', 'spacious'] as const;

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: 'Weak', color: 'var(--error)' };
  if (score <= 3) return { score: 3, label: 'Fair', color: 'var(--warning)' };
  return { score: 5, label: 'Strong', color: 'var(--success)' };
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    bio: '',
    company: '',
    location: '',
    avatar: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [prefs, setPrefs] = useState({
    darkMode: true,
    emailNotifications: true,
    defaultTheme: 'modern-light',
    layoutDensity: 'comfortable' as string,
    fontSize: 'M' as string,
    language: 'en',
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  const fetchProfile = useCallback(async () => {
    try {
      const [profileRes, creditsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/credits'),
      ]);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setProfileForm({
          name: profileData.name || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          company: profileData.company || '',
          location: profileData.location || '',
          avatar: profileData.avatar || '',
        });
        if (profileData.preferences) {
          setPrefs((prev) => ({ ...prev, ...profileData.preferences }));
        }
      }
      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        setCredits(creditsData);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') fetchProfile();
  }, [status, fetchProfile]);

  useEffect(() => {
    if (prefs.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [prefs.darkMode]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setProfileForm((prev) => ({ ...prev, avatar: dataUrl }));
      setSaving(true);
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: dataUrl }),
        });
        if (res.ok) {
          const data = await res.json();
          setProfile((prev) => (prev ? { ...prev, avatar: data.avatar } : null));
          showToast('success', 'Avatar updated');
        }
      } catch {
        showToast('error', 'Failed to upload avatar');
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => (prev ? { ...prev, ...data } : null));
        showToast('success', 'Profile updated successfully');
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Failed to update profile');
      }
    } catch {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showToast('success', 'Password updated successfully');
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Failed to update password');
      }
    } catch {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        showToast('success', 'Preferences saved');
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Failed to save preferences');
      }
    } catch {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pwStrength = getPasswordStrength(passwordForm.newPassword);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
            <div className="absolute inset-1 rounded-full border-2 border-transparent" style={{ borderBottomColor: 'var(--accent)', opacity: 0.4, animation: 'spin 1.2s linear infinite reverse' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes toastOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(20px); } }
        .tab-active { background: var(--accent-subtle); color: var(--accent); box-shadow: inset 3px 0 0 var(--accent), 0 0 20px rgba(59,130,246,0.08); }
      `}</style>

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b shadow-lg'
            : 'bg-transparent'
        }`}
        style={{
          background: scrolled ? 'rgba(10,10,15,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderColor: 'var(--border-subtle)',
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
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium rounded-xl transition-all" style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                Dashboard
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 text-sm font-medium rounded-xl transition-all" style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                Sign Out
              </button>
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
                <Link key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3.5 text-base font-medium rounded-xl transition-all" style={{ color: 'var(--text-secondary)' }}>
                  {link.label}
                </Link>
              ))}
              <div className="my-4" style={{ borderTop: '1px solid var(--border-subtle)' }} />
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3.5 text-base font-medium rounded-xl" style={{ color: 'var(--text-secondary)' }}>
                Dashboard
              </Link>
              <button onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false); }} className="px-4 py-3.5 text-base font-medium rounded-xl text-left" style={{ color: 'var(--text-secondary)' }}>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Page Header */}
      <div className="pt-24 pb-8" style={{ background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
          <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>Manage your account and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="glass-panel p-3 sticky top-24" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-2xl)' }}>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? tab.danger ? 'tab-active !text-[var(--error)] !bg-[var(--error-subtle)] !shadow-[inset_3px_0_0_var(--error),0_0_20px_rgba(239,68,68,0.08)]' : 'tab-active'
                        : ''
                    }`}
                    style={
                      activeTab !== tab.id
                        ? {
                            color: tab.danger ? 'var(--error)' : 'var(--text-secondary)',
                            opacity: tab.danger ? 0.6 : 1,
                          }
                        : undefined
                    }
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.background = tab.danger ? 'var(--error-subtle)' : 'var(--bg-glass-hover)';
                        e.currentTarget.style.color = tab.danger ? 'var(--error)' : 'var(--text-primary)';
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = tab.danger ? 'var(--error)' : 'var(--text-secondary)';
                        e.currentTarget.style.opacity = tab.danger ? '0.6' : '1';
                      }
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0 max-w-2xl" style={{ animation: 'fadeIn 0.3s ease-out' }}>

            {/* ─── Profile Tab ─── */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Your personal information and avatar</p>
                </div>

                <div className="glass-panel p-6" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-2xl)' }}>
                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'var(--bg-glass-active)', border: '2px solid var(--border-hover)' }}>
                        {profileForm.avatar ? (
                          <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold" style={{ color: 'var(--text-secondary)' }}>
                            {profileForm.name?.charAt(0) || session?.user?.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-opacity shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Profile Photo</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                        <input type="text" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                          className="input" style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Email</label>
                        <input type="email" value={profile?.email || ''} disabled
                          className="input" style={{ background: 'var(--bg-glass-active)', borderColor: 'var(--border-default)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Email cannot be changed</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Phone</label>
                        <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000"
                          className="input" style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Company</label>
                        <input type="text" value={profileForm.company} onChange={(e) => setProfileForm((p) => ({ ...p, company: e.target.value }))} placeholder="Acme Inc."
                          className="input" style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Location</label>
                      <input type="text" value={profileForm.location} onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))} placeholder="San Francisco, CA"
                        className="input" style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Bio</label>
                      <textarea value={profileForm.bio} onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell us about yourself..."
                        className="input textarea" style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)', minHeight: '5rem' }}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{profileForm.bio.length}/200</p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button onClick={handleSaveProfile} disabled={saving}
                      className="btn btn-primary" style={{ background: 'var(--accent)', color: 'white' }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Password Tab ─── */}
            {activeTab === 'password' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Password</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Update your password to keep your account secure</p>
                </div>

                <div className="glass-panel p-6" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-2xl)' }}>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Current Password</label>
                      <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        className="input" style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>New Password</label>
                      <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                        className="input" style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                      {passwordForm.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-glass-active)' }}>
                              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(pwStrength.score / 5) * 100}%`, background: pwStrength.color }} />
                            </div>
                            <span className="text-xs font-medium" style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Must be at least 8 characters</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Confirm New Password</label>
                      <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        className="input" style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                      {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button onClick={handleSavePassword} disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
                      className="btn btn-primary" style={{ background: 'var(--accent)', color: 'white' }}
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Preferences Tab ─── */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Preferences</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Customize your experience</p>
                </div>

                <div className="glass-panel p-6" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-2xl)' }}>
                  <div className="space-y-6">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dark Mode</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Switch between light and dark appearance</p>
                      </div>
                      <button onClick={() => setPrefs((p) => ({ ...p, darkMode: !p.darkMode }))}
                        className="toggle" role="switch" aria-checked={prefs.darkMode}
                        style={{ background: prefs.darkMode ? 'var(--accent)' : 'var(--bg-glass-active)', borderColor: prefs.darkMode ? 'var(--accent)' : 'var(--border-default)' }}
                      />
                    </div>

                    {/* Email Notifications Toggle */}
                    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email Notifications</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Receive updates about your sites via email</p>
                      </div>
                      <button onClick={() => setPrefs((p) => ({ ...p, emailNotifications: !p.emailNotifications }))}
                        className="toggle" role="switch" aria-checked={prefs.emailNotifications}
                        style={{ background: prefs.emailNotifications ? 'var(--accent)' : 'var(--bg-glass-active)', borderColor: prefs.emailNotifications ? 'var(--accent)' : 'var(--border-default)' }}
                      />
                    </div>

                    {/* Default Theme */}
                    <div className="py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Default Site Theme</p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>Theme applied to new sites by default</p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {themes.map((theme) => (
                          <button key={theme.id} onClick={() => setPrefs((p) => ({ ...p, defaultTheme: theme.id }))}
                            className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                            style={{
                              background: prefs.defaultTheme === theme.id ? 'var(--accent-subtle)' : 'var(--bg-glass)',
                              borderColor: prefs.defaultTheme === theme.id ? 'var(--accent)' : 'var(--border-default)',
                              color: prefs.defaultTheme === theme.id ? 'var(--accent)' : 'var(--text-secondary)',
                            }}
                          >
                            {theme.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layout Density */}
                    <div className="py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Layout Density</p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>Control spacing in the editor and dashboard</p>
                      <div className="flex gap-2">
                        {densities.map((d) => (
                          <button key={d} onClick={() => setPrefs((p) => ({ ...p, layoutDensity: d }))}
                            className="flex-1 px-3 py-2 rounded-xl text-sm font-medium border capitalize transition-all"
                            style={{
                              background: prefs.layoutDensity === d ? 'var(--accent-subtle)' : 'var(--bg-glass)',
                              borderColor: prefs.layoutDensity === d ? 'var(--accent)' : 'var(--border-default)',
                              color: prefs.layoutDensity === d ? 'var(--accent)' : 'var(--text-secondary)',
                            }}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Font Size</p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>Adjust the base font size</p>
                      <div className="flex gap-2">
                        {fontSizes.map((s) => (
                          <button key={s} onClick={() => setPrefs((p) => ({ ...p, fontSize: s }))}
                            className="flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                            style={{
                              background: prefs.fontSize === s ? 'var(--accent-subtle)' : 'var(--bg-glass)',
                              borderColor: prefs.fontSize === s ? 'var(--accent)' : 'var(--border-default)',
                              color: prefs.fontSize === s ? 'var(--accent)' : 'var(--text-secondary)',
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div className="py-3">
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Language</p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>Select your preferred language</p>
                      <select value={prefs.language} onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
                        className="input select" style={{ background: 'var(--bg-glass)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>{lang.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button onClick={handleSavePreferences} disabled={saving}
                      className="btn btn-primary" style={{ background: 'var(--accent)', color: 'white' }}
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Plan Tab ─── */}
            {activeTab === 'plan' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Plan & Billing</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your subscription and credits</p>
                </div>

                {/* Current Plan Card */}
                <div className="glass-panel p-6" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-2xl)' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Current Plan</p>
                      <p className="text-2xl font-bold mt-1 capitalize" style={{ color: 'var(--text-primary)' }}>{profile?.plan || 'Free'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass-active)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Credits Remaining</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{credits?.credits ?? 0}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>of {credits?.limit ?? 3} monthly</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass-active)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Next Reset</p>
                      <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                        {credits?.nextResetAt
                          ? new Date(credits.nextResetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upgrade Plans */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Upgrade Your Plan</h3>
                  {[
                    { name: 'Pro', price: '$9.99', credits: '30 credits/month', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
                    { name: 'Agency', price: '$29.99', credits: '100 credits/month', gradient: 'linear-gradient(135deg, #f97316, #f43f5e)' },
                  ].map((plan) => (
                    <div key={plan.name} className="glass-panel flex items-center justify-between p-4 transition-all"
                      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{plan.credits}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}<span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>/mo</span></span>
                        <button className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: plan.gradient }}>
                          Upgrade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Danger Zone Tab ─── */}
            {activeTab === 'danger' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--error)' }}>Danger Zone</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Irreversible actions for your account</p>
                </div>

                <div className="p-6 rounded-2xl" style={{ background: 'var(--error-subtle)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--error)' }}>Delete Account</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Permanently delete your account and all associated data including all sites,
                    analytics, and settings. This action cannot be undone.
                  </p>
                  <button
                    onClick={async () => {
                      if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
                      if (!confirm('This will permanently delete all your sites and data. Continue?')) return;
                      const res = await fetch('/api/user/delete', { method: 'DELETE' });
                      if (res.ok) {
                        signOut({ callbackUrl: '/' });
                      } else {
                        showToast('error', 'Failed to delete account');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.5)', color: 'var(--error)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--error-subtle)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            backdropFilter: 'blur(16px)',
            borderLeft: `3px solid ${toast.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
            animation: 'toastIn 0.3s ease-out',
            maxWidth: '380px',
          }}
        >
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--error)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
