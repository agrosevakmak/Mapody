import { NextResponse } from "next/server";
import { scrapeGoogleMaps } from "@/lib/apify";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { ScrapeSchema } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const parsed = ScrapeSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { url } = parsed.data;

    const placeIdMatch = url.match(/place\/([^/@]+)/);
    const mockPlaceId = placeIdMatch ? placeIdMatch[1].replace(/\+/g, "-") : url.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 60);

    // Try DB cache, but don't block on it
    try {
      const cache = await prisma.scrapeCache.findUnique({
        where: { placeId: mockPlaceId },
      });

      if (cache) {
        const age = Date.now() - new Date(cache.scrapedAt).getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (age < sevenDays) {
          return NextResponse.json(cache.rawData);
        }
      }
    } catch (dbError) {
      console.warn("DB cache read failed, continuing without cache:", dbError);
    }

    const data = await scrapeGoogleMaps(url);

    if (!data) {
      return NextResponse.json(
        { error: "Could not extract business data from this URL" },
        { status: 422 }
      );
    }

    // Try to cache in DB, but don't fail if it doesn't work
    try {
      const placeId = data.placeId || mockPlaceId;
      await prisma.scrapeCache.upsert({
        where: { placeId },
        update: { rawData: data as Prisma.InputJsonValue, scrapedAt: new Date() },
        create: { placeId, rawData: data as Prisma.InputJsonValue },
      });
    } catch (dbError) {
      console.warn("DB cache write failed, continuing without cache:", dbError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      { error: "Failed to scrape business data" },
      { status: 500 }
    );
  }
}
