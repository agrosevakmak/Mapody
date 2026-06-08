import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";

export async function GET(
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

    return NextResponse.json({ ...site, data: site.data });
  } catch (error) {
    console.error("Get site error:", error);
    return NextResponse.json({ error: "Failed to get site" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();

    const site = await prisma.site.findFirst({
      where: { id: params.siteId, userId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const updated = await prisma.site.update({
      where: { id: params.siteId },
      data: {
        data: body.data || undefined,
        theme: body.theme || undefined,
        status: body.status || undefined,
        sectionOrder: body.sectionOrder || undefined,
        sections: body.sections || undefined,
        fontPairing: body.fontPairing || undefined,
        customColors: body.customColors || undefined,
        stickyHeader: body.stickyHeader ?? undefined,
        darkMode: body.darkMode ?? undefined,
        bgPattern: body.bgPattern || undefined,
        entranceAnim: body.entranceAnim || undefined,
        favicon: body.favicon || undefined,
      },
    });

    return NextResponse.json({ ...updated, data: updated.data });
  } catch (error) {
    console.error("Update site error:", error);
    return NextResponse.json({ error: "Failed to update site" }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.site.delete({
      where: { id: params.siteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete site error:", error);
    return NextResponse.json({ error: "Failed to delete site" }, { status: 500 });
  }
}
