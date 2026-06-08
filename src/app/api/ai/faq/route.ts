import { NextResponse } from "next/server";
import { generateFAQ } from "@/lib/ai";
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
    const result = generateFAQ(parsed.data as never);
    return NextResponse.json({ faqs: result });
  } catch {
    return NextResponse.json({ error: "Failed to generate FAQ" }, { status: 500 });
  }
}
