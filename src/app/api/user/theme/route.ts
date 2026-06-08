import { NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { ThemeSchema } from '@/lib/validation';

interface ThemePreferences {
  darkMode: boolean;
  fontSize: string;
  layoutDensity: string;
  reducedMotion: boolean;
  accentColor: string;
  sidebarCollapsed: boolean;
}

const defaultPrefs: ThemePreferences = {
  darkMode: false,
  fontSize: 'medium',
  layoutDensity: 'comfortable',
  reducedMotion: false,
  accentColor: 'blue',
  sidebarCollapsed: false,
};

export async function GET() {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  const stored = (user?.preferences as Record<string, unknown>) || {};
  const themePrefs = (stored.theme as Partial<ThemePreferences>) || {};

  const prefs: ThemePreferences = {
    darkMode: typeof themePrefs.darkMode === 'boolean' ? themePrefs.darkMode : defaultPrefs.darkMode,
    fontSize: themePrefs.fontSize || defaultPrefs.fontSize,
    layoutDensity: themePrefs.layoutDensity || defaultPrefs.layoutDensity,
    reducedMotion: typeof themePrefs.reducedMotion === 'boolean' ? themePrefs.reducedMotion : defaultPrefs.reducedMotion,
    accentColor: themePrefs.accentColor || defaultPrefs.accentColor,
    sidebarCollapsed: typeof themePrefs.sidebarCollapsed === 'boolean' ? themePrefs.sidebarCollapsed : defaultPrefs.sidebarCollapsed,
  };

  return NextResponse.json(prefs);
}

export async function PUT(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  const body = await request.json();
  const parsed = ThemeSchema.safeParse(body);

  const prefs: ThemePreferences = {
    darkMode: typeof body.darkMode === 'boolean' ? body.darkMode : defaultPrefs.darkMode,
    fontSize: body.fontSize && ['small', 'medium', 'large', 'xlarge'].includes(body.fontSize)
      ? body.fontSize
      : defaultPrefs.fontSize,
    layoutDensity: parsed.success && parsed.data.fontFamily
      ? defaultPrefs.layoutDensity
      : body.layoutDensity && ['compact', 'comfortable', 'spacious'].includes(body.layoutDensity)
        ? body.layoutDensity
        : defaultPrefs.layoutDensity,
    reducedMotion: typeof body.reducedMotion === 'boolean'
      ? body.reducedMotion
      : defaultPrefs.reducedMotion,
    accentColor: parsed.success && parsed.data.preset
      ? defaultPrefs.accentColor
      : body.accentColor && ['blue', 'purple', 'teal', 'rose', 'amber', 'emerald'].includes(body.accentColor)
        ? body.accentColor
        : defaultPrefs.accentColor,
    sidebarCollapsed: typeof body.sidebarCollapsed === 'boolean'
      ? body.sidebarCollapsed
      : defaultPrefs.sidebarCollapsed,
  };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  const existingPrefs = (user?.preferences as Record<string, unknown>) || {};

  await prisma.user.update({
    where: { id: userId },
    data: {
      preferences: { ...existingPrefs, theme: prefs } as never,
    },
  });

  return NextResponse.json(prefs);
}
