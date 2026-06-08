import { NextResponse } from "next/server";
import { generateTagline } from "@/lib/ai";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { PlaceDataSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();
  try {
    const { data } = await request.json();
    const parsed = PlaceDataSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }
    const result = generateTagline(parsed.data as never);
    return NextResponse.json({ tagline: result });
  } catch {
    return NextResponse.json({ error: "Failed to generate tagline" }, { status: 500 });
  }
}
