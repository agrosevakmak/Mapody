import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized } from '@/lib/api-auth';
import type { SitePage } from '@/lib/page-templates';
import type { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { siteId: string; pageId: string } }
) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const site = await prisma.site.findFirst({
      where: { id: params.siteId, userId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const pages = (site.pages as unknown as SitePage[]) || [];
    const page = pages.find(p => p.id === params.pageId);

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Get page error:', error);
    return NextResponse.json({ error: 'Failed to get page' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { siteId: string; pageId: string } }
) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const site = await prisma.site.findFirst({
      where: { id: params.siteId, userId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const pages = (site.pages as unknown as SitePage[]) || [];
    const pageIndex = pages.findIndex(p => p.id === params.pageId);

    if (pageIndex === -1) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const body = await request.json();
    const page = pages[pageIndex];

    const updatedPage: SitePage = {
      ...page,
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.data !== undefined && { data: body.data }),
      ...(body.sectionOrder !== undefined && { sectionOrder: body.sectionOrder }),
      ...(body.sections !== undefined && { sections: body.sections }),
      ...(body.enabled !== undefined && { enabled: body.enabled }),
    };

    pages[pageIndex] = updatedPage;

    await prisma.site.update({
      where: { id: params.siteId },
      data: { pages: pages as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    console.error('Update page error:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { siteId: string; pageId: string } }
) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const site = await prisma.site.findFirst({
      where: { id: params.siteId, userId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const pages = (site.pages as unknown as SitePage[]) || [];
    const filteredPages = pages.filter(p => p.id !== params.pageId);

    if (filteredPages.length === pages.length) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await prisma.site.update({
      where: { id: params.siteId },
      data: { pages: filteredPages as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
