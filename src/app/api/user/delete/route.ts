import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const userSites = await prisma.site.findMany({
      where: { userId },
      select: { id: true },
    });
    const siteIds = userSites.map((s) => s.id);

    if (siteIds.length > 0) {
      await prisma.site.updateMany({
        where: { parentId: { in: siteIds } },
        data: { parentId: null },
      });
      await prisma.site.deleteMany({ where: { userId } });
    }

    await prisma.account.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
