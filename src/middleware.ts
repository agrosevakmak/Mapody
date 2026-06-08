import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

const API_RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/api/scrape": { limit: 5, windowMs: 60_000 },
  "/api/contact": { limit: 5, windowMs: 60_000 },
  "/api/auth/signup": { limit: 3, windowMs: 300_000 },
  "/api/auth/forgot-password": { limit: 3, windowMs: 300_000 },
  "/api/auth/verify/request": { limit: 3, windowMs: 300_000 },
  "/api/ai": { limit: 20, windowMs: 60_000 },
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);

    for (const [route, config] of Object.entries(API_RATE_LIMITS)) {
      if (pathname === route || pathname.startsWith(route + "/")) {
        const key = `api:${route}:${ip}`;
        if (!checkRateLimit(key, config.limit, config.windowMs)) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
          );
        }
        break;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
