import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorized } from '@/lib/api-auth';
import { createPageFromTemplate, generatePageId, PAGE_TEMPLATES, type SitePage } from '@/lib/page-templates';
import { SitePageCreateSchema } from '@/lib/validation';
import type { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { siteId: string } }
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
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('List pages error:', error);
    return NextResponse.json({ error: 'Failed to list pages' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
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

    const body = await request.json();
    const parsed = SitePageCreateSchema.safeParse(body);
    const templateIds: string[] = parsed.success
      ? parsed.data.templateIds
      : body.templateIds || ['home', 'about', 'services'];

    const existingPages = (site.pages as unknown as SitePage[]) || [];

    const availableTemplates = PAGE_TEMPLATES.filter(
      t => !existingPages.some(p => p.templateId === t.id)
    );

    const templatesToCreate = templateIds
      .filter(id => availableTemplates.some(t => t.id === id))
      .slice(0, 3);

    if (templatesToCreate.length === 0) {
      return NextResponse.json(
        { error: 'No available templates to create pages from' },
        { status: 400 }
      );
    }

    const useCreditRes = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/user/credits/use`,
      {
        method: 'POST',
        headers: { cookie: request.headers.get('cookie') || '' },
      }
    );

    if (!useCreditRes.ok) {
      const creditError = await useCreditRes.json();
      return NextResponse.json(
        { error: creditError.error || 'No credits remaining' },
        { status: useCreditRes.status }
      );
    }

    const creditData = await useCreditRes.json();

    const newPages: SitePage[] = templatesToCreate.map(templateId => {
      return createPageFromTemplate(templateId, generatePageId());
    });

    const updatedPages = [...existingPages, ...newPages];

    const updated = await prisma.site.update({
      where: { id: params.siteId },
      data: { pages: updatedPages as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({
      pages: updatedPages,
      newPages,
      credits: creditData.credits,
    });
  } catch (error) {
    console.error('Create pages error:', error);
    return NextResponse.json({ error: 'Failed to create pages' }, { status: 500 });
  }
}
