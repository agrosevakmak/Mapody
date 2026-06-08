import { NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { uploadToS3 } from "@/lib/s3";
import { UploadSchema } from "@/lib/validation";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const parsed = UploadSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { image, filename } = parsed.data;

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const mimeMatch = image.match(/^data:(image\/[a-z]+);base64,/);
    if (!mimeMatch) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const mimeType = mimeMatch[1];
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: "Unsupported image type. Use PNG, JPEG, WebP, or GIF." }, { status: 400 });
    }

    const base64Data = image.split(",")[1];
    const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
    if (sizeInBytes > MAX_SIZE) {
      return NextResponse.json({ error: "Image must be less than 5MB" }, { status: 400 });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 100);
    const uniqueFilename = `${userId}/${Date.now()}-${safeFilename}`;

    const s3Url = await uploadToS3(base64Data, uniqueFilename, mimeType);
    if (s3Url) {
      return NextResponse.json({ url: s3Url, filename: safeFilename });
    }

    return NextResponse.json({ url: image, filename: safeFilename });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
