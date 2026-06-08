import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { generateSubdomain } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const site = await prisma.site.findFirst({
      where: { id: params.siteId, userId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const subdomain = generateSubdomain((site.data as Record<string, unknown>)?.name as string || "business");

    let finalSubdomain = subdomain;
    let existing = await prisma.site.findUnique({ where: { subdomain: finalSubdomain } });
    let attempts = 0;
    while (existing && attempts < 5) {
      finalSubdomain = generateSubdomain((site.data as Record<string, unknown>)?.name as string || "business");
      existing = await prisma.site.findUnique({ where: { subdomain: finalSubdomain } });
      attempts++;
    }

    const duplicated = await prisma.site.create({
      data: {
        userId,
        subdomain: finalSubdomain,
        status: "draft",
        theme: site.theme,
        data: site.data ?? undefined,
        sectionOrder: site.sectionOrder ?? undefined,
        sections: site.sections ?? undefined,
        fontPairing: site.fontPairing ?? undefined,
        customColors: site.customColors ?? undefined,
        stickyHeader: site.stickyHeader,
        darkMode: site.darkMode,
        bgPattern: site.bgPattern,
        entranceAnim: site.entranceAnim,
        favicon: site.favicon,
      },
    });

    return NextResponse.json({ id: duplicated.id, subdomain: duplicated.subdomain });
  } catch (error) {
    console.error("Duplicate site error:", error);
    return NextResponse.json({ error: "Failed to duplicate site" }, { status: 500 });
  }
}
