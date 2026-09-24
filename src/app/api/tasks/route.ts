import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.title = {
        contains: search,
      };
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (['createdAt', 'title', 'status'].includes(sort)) {
      orderBy[sort as keyof Prisma.TaskOrderByWithRelationInput] = order === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { workflows: true },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({ tasks, total, page, limit });
  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, prompt, priority, tags } = body;

    if (!title || !prompt) {
      return NextResponse.json({ error: 'Title and prompt are required' }, { status: 400 });
    }

    let user = await prisma.user.findFirst({
      where: { email: 'demo@insightai.com' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@insightai.com',
          name: 'Demo User',
        },
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        prompt,
        priority: priority || 'medium',
        tags: tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : JSON.stringify([]),
        userId: user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
