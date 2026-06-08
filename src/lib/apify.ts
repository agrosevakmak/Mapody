import https from "https";
import http from "http";

function fetchJson(url: string, headers: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers, timeout: 8000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON"));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

export function isValidGoogleMapsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const validHosts = [
      "google.com",
      "google.co.uk",
      "google.de",
      "google.fr",
      "google.co.jp",
      "google.co.in",
      "google.ca",
      "google.com.au",
      "maps.google.com",
      "goo.gl",
      "maps.app.goo.gl",
    ];
    if (!validHosts.includes(host)) return false;

    const path = parsed.pathname.toLowerCase();
    const full = url.toLowerCase();
    return (
      path.includes("/maps/") ||
      path.includes("/maps") ||
      full.includes("mapsplace") ||
      full.includes("/maps/place/") ||
      full.includes("maps/embed") ||
      full.includes("goo.gl/maps") ||
      full.includes("maps.app.goo.gl") ||
      full.includes("?q=") ||
      (full.includes("@") && full.includes("maps"))
    );
  } catch {
    return false;
  }
}

export interface ApifyPlaceResult {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  category?: string;
  description?: string;
  rating?: number;
  totalReviews?: number;
  reviews?: Array<{
    authorName?: string;
    rating?: number;
    text?: string;
    relativeTime?: string;
  }>;
  images?: string[];
  openingHours?: Record<string, string>;
  menu?: string;
  services?: string[];
  socialLinks?: string[];
  priceRange?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  title?: string;
  about?: string;
  reviewsCount?: number;
  id?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  "mall": "Shopping Mall",
  "building": "Business",
  "retail": "Retail",
  "shop": "Shop",
  "restaurant": "Restaurant",
  "cafe": "Cafe",
  "hotel": "Hotel",
  "hospital": "Hospital",
  "clinic": "Clinic",
  "pharmacy": "Pharmacy",
  "bank": "Bank",
  "supermarket": "Supermarket",
  "cinema": "Cinema",
  "museum": "Museum",
  "school": "School",
  "university": "University",
  "park": "Park",
  "sports_centre": "Sports Centre",
  "gym": "Gym",
  "fuel": "Gas Station",
  "parking": "Parking",
  "tourism": "Tourism",
  "attraction": "Attraction",
};

function mapCategory(raw: string): string {
  const mapped = CATEGORY_MAP[raw.toLowerCase()];
  return mapped || raw.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}

export async function scrapeGoogleMaps(url: string): Promise<ApifyPlaceResult | null> {
  const API_TOKEN = process.env.APIFY_API_KEY || "";
  if (API_TOKEN) {
    try {
      const result = await scrapeViaApify(url, API_TOKEN);
      if (result) return result;
    } catch (e) {
      console.warn("Apify failed, falling back to built-in scraper:", e);
    }
  }

  return scrapeDirectly(url);
}

async function scrapeViaApify(url: string, token: string): Promise<ApifyPlaceResult | null> {
  const ACTOR_ID = process.env.APIFY_ACTOR_ID || "nwua9Gu5YrADL7ZDj";
  const APIFY_API_BASE = "https://api.apify.com/v2";

  const runResponse = await fetch(
    `${APIFY_API_BASE}/acts/${ACTOR_ID}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchStringsArray: [],
        placeUrls: [url],
        maxReviews: 10,
        maxImages: 20,
      }),
    }
  );

  if (!runResponse.ok) throw new Error(`Apify run failed: ${runResponse.statusText}`);

  const runResponseData = await runResponse.json();
  const run: { id: string; status: string } = runResponseData.data || runResponseData;
  let status = run.status;
  const runId = run.id;

  while (status === "READY" || status === "RUNNING") {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const statusResponse = await fetch(
      `${APIFY_API_BASE}/acts/${ACTOR_ID}/runs/${runId}?token=${token}`
    );
    const statusData: { status: string } = await statusResponse.json();
    status = statusData.status;
  }

  if (status !== "SUCCEEDED") throw new Error(`Apify run failed with status: ${status}`);

  const runInfoResponse = await fetch(
    `${APIFY_API_BASE}/acts/${ACTOR_ID}/runs/${runId}?token=${token}`
  );
  const runInfo = await runInfoResponse.json();
  const datasetId = runInfo.defaultDatasetId;
  if (!datasetId) throw new Error("No dataset ID returned");

  const dataResponse = await fetch(
    `${APIFY_API_BASE}/datasets/${datasetId}/items?token=${token}`
  );
  const data: ApifyPlaceResult[] = await dataResponse.json();
  if (!data || data.length === 0) throw new Error("No data returned from Apify");

  return normalizeApifyData(data[0]);
}

async function scrapeDirectly(url: string): Promise<ApifyPlaceResult> {
  const name = extractNameFromUrl(url);
  const coordinates = extractCoordinatesFromUrl(url);
  const placeId = extractPlaceIdFromUrl(url);

  let address = "";
  let phone = "";
  let website = "";
  let category = "";
  let description = "";
  let rating = 0;
  let totalReviews = 0;
  let images: string[] = [];
  let openingHours: Record<string, string> = {};
  let socialLinks: string[] = [];
  let priceRange = "";

  try {
    if (name) {
      const searchQuery = encodeURIComponent(name);
      const searchUrl = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1&addressdetails=1`;
      const results = await fetchJson(searchUrl, { "User-Agent": "Mapody/1.0 (business-website-generator)" });
      if (results && results.length > 0) {
        const data = results[0];
        if (data.display_name) address = data.display_name;
        if (data.type || data.class) {
          const cat = data.type === "yes" ? (data.class || "business") : data.type;
          category = mapCategory(cat);
        }
      }
    }

    if (!address && coordinates) {
      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json&addressdetails=1&zoom=18`;
      const data = await fetchJson(reverseUrl, { "User-Agent": "Mapody/1.0 (business-website-generator)" });
      if (data && data.display_name) address = data.display_name;
      if (data && (data.type || data.class)) {
        const cat = data.type === "yes" ? (data.class || "business") : data.type;
        category = mapCategory(cat);
      }
    }
  } catch (e) {
    console.error("[Scraper] Nominatim lookup failed:", e);
  }

  const staticMapUrl = coordinates
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=15&size=800x600&maptype=roadmap&markers=color:red%7C${coordinates.lat},${coordinates.lng}`
    : "";

  if (staticMapUrl) images = [staticMapUrl];

  try {
    const parsedUrl = new URL(url);
    website = parsedUrl.origin;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    const html = await response.text();

    const ogImageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
    if (ogImageMatch && ogImageMatch[1] && !ogImageMatch[1].includes("googlelogo")) {
      images = [ogImageMatch[1], ...images];
    }

    const ogDescMatch = html.match(/property="og:description"\s+content="([^"]+)"/i);
    if (ogDescMatch && ogDescMatch[1] && !ogDescMatch[1].includes("Find local businesses")) {
      description = description || ogDescMatch[1];
    }

    const ogTitleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i);
    if (ogTitleMatch) {
      const parsed = ogTitleMatch[1].replace(/\s*[-–]\s*Google Maps?\s*$/i, "").trim();
      if (parsed && parsed !== "Google Maps") description = description || parsed;
    }

    const jsonLdMatches = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonStr = match.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "");
          const data = JSON.parse(jsonStr);
          if (data.name) description = description || data.name;
          if (data.telephone) phone = data.telephone;
          if (data.address) {
            const addr = data.address;
            address = address || [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode]
              .filter(Boolean)
              .join(", ");
          }
          if (data.image) {
            const imgs = Array.isArray(data.image) ? data.image : [data.image];
            const newImgs = imgs.filter((i: string) => typeof i === "string" && !i.includes("googlelogo"));
            images = [...newImgs, ...images].slice(0, 20);
          }
          if (data.aggregateRating) {
            rating = parseFloat(data.aggregateRating.ratingValue) || 0;
            totalReviews = parseInt(data.aggregateRating.reviewCount) || 0;
          }
          if (data.openingHoursSpecification) {
            const specs = Array.isArray(data.openingHoursSpecification)
              ? data.openingHoursSpecification
              : [data.openingHoursSpecification];
            for (const spec of specs) {
              if (spec.dayOfWeek && spec.opens && spec.closes) {
                const day = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek[0] : spec.dayOfWeek;
                const dayName = day.replace(/https?:\/\/schema\.org\//g, "");
                openingHours[dayName] = `${spec.opens} - ${spec.closes}`;
              }
            }
          }
          if (data.priceRange) priceRange = data.priceRange;
          if (data.url) website = data.url;
        } catch {}
      }
    }

    const photoMatches = html.match(/https:\/\/lh\d+\.googleusercontent\.com[^"'\s)]+/g);
    if (photoMatches) {
      const uniquePhotos = Array.from(new Set(photoMatches))
        .filter((p) => !p.includes("googlelogo") && !p.includes("gstatic.com") && (p.includes("/photo") || p.includes("/w")))
        .slice(0, 20);
      if (uniquePhotos.length > 0) images = [...uniquePhotos, ...images].slice(0, 20);
    }
  } catch (error) {
    console.error("Direct scrape error:", error);
  }

  const uniqueImages = Array.from(new Set(images)).slice(0, 20);

  const businessName = name || description || "Your Business";
  const fallbackImages = [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  ];

  return normalizeApifyData({
    name: businessName,
    address: address || (coordinates ? `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}` : ""),
    phone,
    website: website || url,
    category,
    description: description && description !== businessName ? description : `${businessName} is a local business. Visit us to experience our products and services.`,
    rating,
    totalReviews,
    reviews: [],
    images: uniqueImages.length > 0 ? uniqueImages : fallbackImages,
    openingHours,
    services: [],
    socialLinks,
    priceRange,
    coordinates,
    placeId,
  });
}

function normalizeApifyData(raw: ApifyPlaceResult): ApifyPlaceResult {
  return {
    name: raw.name || raw.title || "",
    address: raw.address || "",
    phone: raw.phone || "",
    website: raw.website || "",
    category: raw.category || "",
    description: raw.description || raw.about || "",
    rating: raw.rating || 0,
    totalReviews: raw.totalReviews || raw.reviewsCount || 0,
    reviews: (raw.reviews || []).slice(0, 10).map((r) => ({
      authorName: r.authorName || "Anonymous",
      rating: r.rating || 0,
      text: r.text || "",
      relativeTime: r.relativeTime || "",
    })),
    images: (raw.images || []).slice(0, 20),
    openingHours: raw.openingHours || {},
    menu: raw.menu || "",
    services: raw.services || [],
    socialLinks: raw.socialLinks || [],
    priceRange: raw.priceRange || "",
    coordinates: raw.coordinates || undefined,
    placeId: raw.placeId || raw.id || "",
  };
}

function extractNameFromUrl(url: string): string {
  const placeMatch = url.match(/place\/([^/@]+)/);
  if (placeMatch) {
    return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
  }

  const queryMatch = url.match(/[?&]q=([^&]+)/);
  if (queryMatch) {
    return decodeURIComponent(queryMatch[1].replace(/\+/g, " "));
  }

  const atMatch = url.match(/@[\d.-]+,[\d.-]+.*?\/([\w\s-]+)/);
  if (atMatch) {
    return decodeURIComponent(atMatch[1].replace(/\+/g, " "));
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const segment = pathParts[pathParts.length - 1]
        .replace(/[-_]/g, " ")
        .replace(/\.[^.]+$/, "");
      if (segment.length > 2) {
        return segment.charAt(0).toUpperCase() + segment.slice(1);
      }
    }
    return host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1);
  } catch {
    return "Your Business";
  }
}

function extractCoordinatesFromUrl(url: string): { lat: number; lng: number } | undefined {
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }

  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }

  return undefined;
}

function extractPlaceIdFromUrl(url: string): string {
  const match = url.match(/place\/([^/@]+)/);
  return match ? match[1].replace(/\+/g, "-") : url.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 60);
}
