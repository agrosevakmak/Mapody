import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";

const CREDIT_LIMITS: Record<string, number> = {
  free: 3,
  starter: 25,
  pro: 100,
  agency: 500,
};

const RESET_INTERVAL_DAYS = 30;

export async function GET() {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        credits: true,
        creditsResetAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let { plan, credits, creditsResetAt } = user;
    const limit = CREDIT_LIMITS[plan] ?? CREDIT_LIMITS.free;

    if (creditsResetAt) {
      const daysSinceReset = Math.floor(
        (Date.now() - new Date(creditsResetAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceReset >= RESET_INTERVAL_DAYS) {
        credits = limit;
        creditsResetAt = new Date();
        await prisma.user.update({
          where: { id: userId },
          data: { credits, creditsResetAt },
        });
      }
    } else {
      credits = limit;
      creditsResetAt = new Date();
      await prisma.user.update({
        where: { id: userId },
        data: { credits, creditsResetAt },
      });
    }

    const nextResetAt = creditsResetAt
      ? new Date(new Date(creditsResetAt).getTime() + RESET_INTERVAL_DAYS * 24 * 60 * 60 * 1000)
      : null;

    return NextResponse.json({
      plan,
      credits,
      limit,
      creditsResetAt,
      nextResetAt,
    });
  } catch (error) {
    console.error("Get credits error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
