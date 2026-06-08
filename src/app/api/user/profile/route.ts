import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        company: true,
        location: true,
        avatar: true,
        image: true,
        plan: true,
        credits: true,
        preferences: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const { name, phone, bio, company, location, avatar, preferences } = body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(company !== undefined && { company: company || null }),
        ...(location !== undefined && { location: location || null }),
        ...(avatar !== undefined && { avatar: avatar || null }),
        ...(preferences !== undefined && { preferences }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        company: true,
        location: true,
        avatar: true,
        image: true,
        plan: true,
        credits: true,
        preferences: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
