import { NextResponse } from "next/server";
import { generateTagline } from "@/lib/ai";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import type { ApifyPlaceResult } from "@/lib/apify";

function validatePlaceData(data: unknown): data is ApifyPlaceResult {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.name === "string" || typeof obj.category === "string";
}

export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();
  try {
    const { data } = await request.json();
    if (!validatePlaceData(data)) {
      return NextResponse.json({ error: "Invalid business data" }, { status: 400 });
    }
    const result = generateTagline(data);
    return NextResponse.json({ tagline: result });
  } catch {
    return NextResponse.json({ error: "Failed to generate tagline" }, { status: 500 });
  }
}
