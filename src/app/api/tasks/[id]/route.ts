import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;
    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: {
        workflows: {
          include: {
            steps: {
              orderBy: { order: 'asc' },
            },
            datasets: {
              include: {
                _count: {
                  select: { dataPoints: true },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error in GET /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;
    
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, title, priority, tags } = body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(priority && { priority }),
        ...(tags && { tags: typeof tags === 'string' ? tags : JSON.stringify(tags) }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error in PATCH /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;
    
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
