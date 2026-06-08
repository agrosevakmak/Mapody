import { NextResponse } from "next/server";
import { scrapeGoogleMaps, isValidGoogleMapsUrl } from "@/lib/apify";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Please provide a valid URL" },
        { status: 400 }
      );
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Please provide a valid HTTP or HTTPS URL" },
        { status: 400 }
      );
    }

    if (!isValidGoogleMapsUrl(url)) {
      return NextResponse.json(
        { error: "Please provide a valid Google Maps URL or shareable link" },
        { status: 400 }
      );
    }

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
