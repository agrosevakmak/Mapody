import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactSchema } from "@/lib/validation";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { name, email, message } = parsed.data;
    const siteId = body.siteId as string;
    const phone = body.phone as string | undefined;

    if (!siteId) {
      return NextResponse.json({ error: "Site ID is required" }, { status: 400 });
    }

    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const existingData = (site.data as Record<string, unknown>) || {};
    const contactSubmissions = (existingData.contactSubmissions as Array<Record<string, unknown>>) || [];

    contactSubmissions.push({
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      read: false,
    });

    await prisma.site.update({
      where: { id: siteId },
      data: {
        data: { ...existingData, contactSubmissions } as never,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
