import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { generateSubdomain } from "@/lib/utils";
import { scrapeGoogleMaps, isValidGoogleMapsUrl } from "@/lib/apify";

export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { urls } = await request.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "URLs array is required" }, { status: 400 });
    }

    if (urls.length > 50) {
      return NextResponse.json({ error: "Maximum 50 URLs per import" }, { status: 400 });
    }

    const validUrls = urls.filter((url: string) => isValidGoogleMapsUrl(url));
    if (validUrls.length === 0) {
      return NextResponse.json({ error: "No valid Google Maps URLs found" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const url of validUrls.slice(0, 50)) {
      try {
        const scrapedData = await scrapeGoogleMaps(url);
        let subdomain = generateSubdomain(scrapedData?.name || "business");
        let existing = await prisma.site.findUnique({ where: { subdomain } });
        let attempts = 0;
        while (existing && attempts < 5) {
          subdomain = generateSubdomain(scrapedData?.name || "business");
          existing = await prisma.site.findUnique({ where: { subdomain } });
          attempts++;
        }

        const site = await prisma.site.create({
          data: {
            userId,
            subdomain,
            status: "draft",
            theme: "modern-light",
            data: scrapedData ? { ...scrapedData, importUrl: url } : { importUrl: url, name: "Imported Business" },
          },
        });

        results.push({ id: site.id, subdomain, url, name: scrapedData?.name || "Unknown" });
      } catch (err) {
        errors.push({ url, error: err instanceof Error ? err.message : "Scrape failed" });
      }
    }

    return NextResponse.json({
      created: results.length,
      failed: errors.length,
      sites: results,
      errors,
    });
  } catch {
    return NextResponse.json({ error: "Failed to import" }, { status: 500 });
  }
}
