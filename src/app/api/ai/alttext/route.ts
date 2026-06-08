import { NextResponse } from "next/server";
import { generateAltText } from "@/lib/ai";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { z } from "zod";

const AltTextSchema = z.object({
  data: z.object({ name: z.string().min(1) }).passthrough(),
  imageIndex: z.number().int().min(0).optional().default(0),
});

export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();
  try {
    const body = await request.json();
    const parsed = AltTextSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }
    const { data, imageIndex } = parsed.data;
    const result = generateAltText(data as never, imageIndex);
    return NextResponse.json({ altText: result });
  } catch {
    return NextResponse.json({ error: "Failed to generate alt text" }, { status: 500 });
  }
}
