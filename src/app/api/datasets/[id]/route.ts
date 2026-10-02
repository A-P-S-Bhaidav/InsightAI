import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { validateData } from '@/lib/ai/data-validator';
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const dataset = await prisma.dataset.findFirst({
      where: { id, workflow: { task: { userId } } },
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
      data: dp.data as Record<string, unknown> | null
    }));

    // Compute statistics on all points
    const allPoints = await prisma.dataPoint.findMany({ where: { datasetId: id } });
    const parsedAllPoints = allPoints.map(p => ({
      ...p,
      data: (p.data as Record<string, unknown>) || {}
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

    // Compute quality breakdown using enterprise validator
    const allData = parsedAllPoints.map(p => p.data);
    const qualityReport = await validateData(allData);

    // Compute source distribution
    const sourceDistribution: Record<string, number> = {};
    for (const dp of allPoints) {
      if (dp.sourceId) {
        const source = rawDbDataPoints.find(r => r.id === dp.id)?.source;
        const domain = source?.domain || 'Unknown';
        sourceDistribution[domain] = (sourceDistribution[domain] || 0) + 1;
      } else {
        sourceDistribution['AI Knowledge Base'] = (sourceDistribution['AI Knowledge Base'] || 0) + 1;
      }
    }

    return NextResponse.json({
      dataset,
      dataPoints,
      pagination: { total: totalDataPoints, page, limit },
      stats,
      qualityBreakdown: {
        overallScore: qualityReport.overallScore,
        completeness: qualityReport.completeness,
        consistency: qualityReport.consistency,
        accuracy: qualityReport.accuracy,
        fieldQualities: qualityReport.fieldQualities || [],
        issues: qualityReport.issues,
        suggestions: qualityReport.suggestions,
      },
      sourceDistribution,
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;
    
    const dataset = await prisma.dataset.findFirst({
      where: { id, workflow: { task: { userId } } },
    });
    
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    await prisma.dataset.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/datasets/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
