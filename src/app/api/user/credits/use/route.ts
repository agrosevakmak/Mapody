import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized } from '@/lib/api-auth';

export async function POST() {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const result = await prisma.$executeRaw`
      UPDATE "User"
      SET credits = credits - 1, "updatedAt" = NOW()
      WHERE id = ${userId} AND credits > 0
    `;

    if (result === 0) {
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade your plan.', credits: 0 },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return NextResponse.json({ credits: user?.credits ?? 0 });
  } catch (error) {
    console.error('Credit use error:', error);
    return NextResponse.json({ error: 'Failed to use credit' }, { status: 500 });
  }
}
