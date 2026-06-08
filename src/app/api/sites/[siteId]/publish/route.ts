import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";

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

    const updated = await prisma.site.update({
      where: { id: params.siteId },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
    });

    const url = `https://${updated.subdomain}.mapody.site`;

    return NextResponse.json({
      ...updated,
      data: updated.data,
      url,
    });
  } catch (error) {
    console.error("Publish site error:", error);
    return NextResponse.json({ error: "Failed to publish site" }, { status: 500 });
  }
}
