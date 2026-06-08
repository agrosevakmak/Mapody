import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { AnalyticsPostSchema } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const parsed = AnalyticsPostSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { siteId, event, data } = parsed.data;

    const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const analytics = (site.analytics as Record<string, unknown>) || {};
    const events = (analytics.events as Array<Record<string, unknown>>) || [];
    events.push({ event, data, timestamp: new Date().toISOString() });

    const clicks = (analytics.clicks as Record<string, number>) || {};
    if (event === "cta_click" && data) {
      const label = (data as Record<string, unknown>).label || "unknown";
      clicks[label as string] = (clicks[label as string] || 0) + 1;
    }

    const views = ((analytics.views as number) || 0) + (event === "page_view" ? 1 : 0);

    const updateData: Prisma.SiteUpdateInput = {
      analytics: { ...analytics, events: events.slice(-1000), clicks, views } as unknown as Prisma.InputJsonValue,
    };

    await prisma.site.update({ where: { id: siteId }, data: updateData });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const url = new URL(request.url);
    const siteId = url.searchParams.get("siteId");

    if (siteId) {
      const site = await prisma.site.findFirst({ where: { id: siteId, userId } });
      if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
      return NextResponse.json({ analytics: site.analytics });
    }

    const sites = await prisma.site.findMany({ where: { userId }, select: { id: true, subdomain: true, analytics: true, status: true } });
    return NextResponse.json({ sites });
  } catch {
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 });
  }
}
