import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { UserPreferencesSchema } from "@/lib/validation";

const DEFAULT_PREFERENCES = {
  darkMode: false,
  emailNotifications: true,
  defaultTheme: "modern-light",
  layoutDensity: "comfortable",
  fontSize: "medium",
  language: "en",
};

export async function GET() {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const preferences =
      user.preferences && typeof user.preferences === "object"
        ? { ...DEFAULT_PREFERENCES, ...(user.preferences as Record<string, unknown>) }
        : DEFAULT_PREFERENCES;

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const parsed = UserPreferencesSchema.safeParse(body);

    const validBody = parsed.success ? parsed.data : {};

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const existing =
      user?.preferences && typeof user.preferences === "object"
        ? (user.preferences as Record<string, unknown>)
        : {};

    const merged = { ...DEFAULT_PREFERENCES, ...existing, ...validBody };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { preferences: merged },
      select: { preferences: true },
    });

    return NextResponse.json(updated.preferences);
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
