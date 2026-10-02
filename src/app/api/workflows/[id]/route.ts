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
    const workflow = await prisma.workflow.findFirst({
      where: { id, task: { userId } },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
        datasets: true,
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error in GET /api/workflows/[id]:', error);
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
    
    const existing = await prisma.workflow.findFirst({ where: { id, task: { userId } } });
    if (!existing) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, progress } = body;

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error in PATCH /api/workflows/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
