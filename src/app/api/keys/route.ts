import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `iai_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

// List user's API keys
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true, name: true, keyPrefix: true, isActive: true,
        permissions: true, usageCount: true, lastUsedAt: true,
        expiresAt: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error in GET /api/keys:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create a new API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, permissions, expiresInDays } = body;

    if (!name || name.length < 1) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Max 5 active keys per user
    const activeCount = await prisma.apiKey.count({
      where: { userId: session.user.id, isActive: true },
    });
    if (activeCount >= 5) {
      return NextResponse.json({ error: 'Maximum 5 active API keys allowed' }, { status: 400 });
    }

    const { key, hash, prefix } = generateApiKey();
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 86400000)
      : null;

    await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name,
        keyHash: hash,
        keyPrefix: prefix,
        permissions: permissions || 'read,write',
        expiresAt,
      },
    });

    // Return the full key only on creation — never again
    return NextResponse.json({
      key,
      prefix,
      name,
      message: 'Save this key — it will not be shown again.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/keys:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Revoke an API key
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
    }

    await prisma.apiKey.updateMany({
      where: { id: keyId, userId: session.user.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/keys:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
