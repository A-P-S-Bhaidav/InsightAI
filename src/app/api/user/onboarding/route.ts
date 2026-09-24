import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { rateLimit } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const allowed = await rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
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

    return NextResponse.json({ hasCompletedOnboarding: user.hasCompletedOnboarding });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const allowed = await rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
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

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { hasCompletedOnboarding: true },
    });

    return NextResponse.json({ hasCompletedOnboarding: updatedUser.hasCompletedOnboarding });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
