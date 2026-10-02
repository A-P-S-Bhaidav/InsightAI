import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowWhereInput = {
      task: { userId }
    };
    if (status) {
      where.status = status;
    }

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          task: {
            select: { id: true, title: true, status: true },
          },
          _count: {
            select: { steps: true },
          },
        },
      }),
      prisma.workflow.count({ where }),
    ]);

    return NextResponse.json({ workflows, total, page, limit });
  } catch (error) {
    console.error('Error in GET /api/workflows:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
