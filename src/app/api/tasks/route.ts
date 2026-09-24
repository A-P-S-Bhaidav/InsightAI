import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, sanitizeInput } from '@/lib/security';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { createTaskSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};
    if (status && ['pending', 'running', 'completed', 'failed'].includes(status)) {
      where.status = status;
    }
    if (search) {
      where.title = { contains: sanitizeInput(search) };
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
          workflows: {
            include: {
              datasets: true,
              steps: { orderBy: { order: 'asc' } },
            },
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
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const allowed = await rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();

    // Zod validation
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { title, prompt, priority, tags } = parsed.data;

    // Get authenticated user or create demo user
    const session = await auth();
    let userId: string;

    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      let user = await prisma.user.findFirst({ where: { email: 'demo@insightai.com' } });
      if (!user) {
        user = await prisma.user.create({ data: { email: 'demo@insightai.com', name: 'Demo User' } });
      }
      userId = user.id;
    }

    const task = await prisma.task.create({
      data: {
        title: sanitizeInput(title),
        prompt: sanitizeInput(prompt),
        priority,
        tags: JSON.stringify(tags),
        userId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
