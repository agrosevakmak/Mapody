import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { generateSubdomain } from "@/lib/utils";
import { scrapeGoogleMaps } from "@/lib/apify";
import { BulkImportSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const parsed = BulkImportSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { urls } = parsed.data;

    const results = [];
    const errors = [];

    for (const url of urls) {
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
