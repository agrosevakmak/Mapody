import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSubdomain } from "@/lib/utils";
import { requireAuth, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const sites = await prisma.site.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const parsed = sites.map((s) => ({
      ...s,
      data: s.data,
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("List sites error:", error);
    return NextResponse.json({ error: "Failed to list sites" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();

    const subdomain = generateSubdomain(body.data?.name || "business");
    const existingSite = await prisma.site.findUnique({
      where: { subdomain },
    });

    if (existingSite) {
      return NextResponse.json(
        { error: "Subdomain already exists, try again" },
        { status: 409 }
      );
    }

    const site = await prisma.site.create({
      data: {
        userId,
        placeId: body.data?.placeId || null,
        subdomain,
        status: "draft",
        theme: body.theme || "modern-light",
        data: body.data || {},
        sectionOrder: body.sectionOrder || null,
        sections: body.sections || null,
        fontPairing: body.fontPairing || null,
        customColors: body.customColors || null,
        stickyHeader: body.stickyHeader ?? null,
        darkMode: body.darkMode ?? null,
        bgPattern: body.bgPattern || null,
        entranceAnim: body.entranceAnim || null,
        favicon: body.favicon || null,
      },
    });

    return NextResponse.json({ ...site, data: site.data });
  } catch (error) {
    console.error("Create site error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to create site: ${message}` }, { status: 500 });
  }
}
