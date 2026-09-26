import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security';
import prisma from '@/lib/db';
import { inngest } from '@/lib/inngest/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const allowed = await rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status === 'running') {
      return NextResponse.json({ error: 'Task already running' }, { status: 409 });
    }

    // Mark task as running immediately
    await prisma.task.update({
      where: { id },
      data: { status: 'running' },
    });

    try {
      // Dispatch background job to Inngest
      await inngest.send({
        name: "task.execute",
        data: { taskId: id },
      });
      return NextResponse.json({
        success: true,
        message: "Task dispatched to background queue successfully",
      });
    } catch (dispatchError) {
      // Revert status if dispatch fails (e.g. missing Inngest API key)
      await prisma.task.update({
        where: { id },
        data: { status: 'failed', errorMessage: 'Failed to dispatch background worker. Check Inngest configuration.' },
      });
      throw dispatchError;
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to dispatch task';
    console.error('[Execute] Dispatch error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
