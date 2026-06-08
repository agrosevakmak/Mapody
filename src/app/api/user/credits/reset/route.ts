import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized } from '@/lib/api-auth';

const planCredits: Record<string, number> = {
  free: 3,
  starter: 25,
  pro: 100,
  agency: 500,
};

const RESET_COOLDOWN_DAYS = 30;

export async function POST() {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, creditsResetAt: true },
    });

    if (!user) return unauthorized();

    if (user.creditsResetAt) {
      const daysSinceReset = Math.floor(
        (Date.now() - new Date(user.creditsResetAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceReset < RESET_COOLDOWN_DAYS) {
        return NextResponse.json(
          { error: `Credits can only be reset every ${RESET_COOLDOWN_DAYS} days. Try again later.` },
          { status: 429 }
        );
      }
    }

    const credits = planCredits[user.plan] ?? 3;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        credits,
        creditsResetAt: new Date(),
      },
      select: { credits: true, creditsResetAt: true, plan: true },
    });

    return NextResponse.json({
      credits: updated.credits,
      creditsResetAt: updated.creditsResetAt,
      plan: updated.plan,
    });
  } catch (error) {
    console.error('Credit reset error:', error);
    return NextResponse.json({ error: 'Failed to reset credits' }, { status: 500 });
  }
}
