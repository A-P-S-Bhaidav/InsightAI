import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        workflow: true,
      },
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    const [rawDbDataPoints, totalDataPoints] = await Promise.all([
      prisma.dataPoint.findMany({
        where: { datasetId: id },
        skip,
        take: limit,
        include: { source: true },
      }),
      prisma.dataPoint.count({ where: { datasetId: id } }),
    ]);

    const dataPoints = rawDbDataPoints.map(dp => ({
      ...dp,
      data: dp.data ? JSON.parse(dp.data) : null
    }));

    // Compute basic statistics on a sample (or all if small enough)
    const allPoints = await prisma.dataPoint.findMany({ where: { datasetId: id } });
    const parsedAllPoints = allPoints.map(p => ({
      ...p,
      data: (p.data ? JSON.parse(p.data) : {}) as Record<string, unknown>
    }));
    
    const stats: Record<string, { min?: number, max?: number, uniqueValues: number, type: string }> = {};
    
    if (parsedAllPoints.length > 0 && parsedAllPoints[0].data) {
      const keys = Object.keys(parsedAllPoints[0].data);
      for (const key of keys) {
        const values = parsedAllPoints.map((p) => p.data[key]).filter((v) => v !== undefined && v !== null);
        const unique = new Set(values);
        let type = 'string';
        if (values.length > 0 && typeof values[0] === 'number') {
           type = 'number';
        }
        
        stats[key] = {
           type,
           uniqueValues: unique.size,
           ...(type === 'number' ? {
               min: Math.min(...(values as number[])),
               max: Math.max(...(values as number[])),
           } : {})
        };
      }
    }

    return NextResponse.json({
      dataset,
      dataPoints,
      pagination: { total: totalDataPoints, page, limit },
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/datasets/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.dataset.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/datasets/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
