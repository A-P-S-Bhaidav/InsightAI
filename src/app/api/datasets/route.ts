import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = {
        contains: search,
      };
    }

    const [datasets, total] = await Promise.all([
      prisma.dataset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          workflow: {
            select: { id: true, name: true, task: { select: { id: true, title: true } } },
          },
          _count: {
            select: { dataPoints: true },
          },
        },
      }),
      prisma.dataset.count({ where }),
    ]);

    return NextResponse.json({ datasets, total, page, limit });
  } catch (error) {
    console.error('Error in GET /api/datasets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
