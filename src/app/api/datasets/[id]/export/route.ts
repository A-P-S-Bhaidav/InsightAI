import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const dataset = await prisma.dataset.findUnique({ where: { id } });
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    const dataPoints = await prisma.dataPoint.findMany({
      where: { datasetId: id },
      include: { source: true },
    });

    const parsedData = dataPoints.map(dp => {
      const data = dp.data ? JSON.parse(dp.data) : {};
      return {
        ...data,
        _confidence: dp.confidence,
        _valid: dp.isValid,
        _source: dp.source?.domain || 'unknown',
      };
    });

    if (format === 'csv') {
      if (parsedData.length === 0) {
        return new NextResponse('No data', { status: 200, headers: { 'Content-Type': 'text/csv' } });
      }

      const headers = Object.keys(parsedData[0]);
      const csvRows = [
        headers.join(','),
        ...parsedData.map(row =>
          headers.map(h => {
            const val = String((row as Record<string, unknown>)[h] ?? '');
            return val.includes(',') || val.includes('"') || val.includes('\n')
              ? `"${val.replace(/"/g, '""')}"`
              : val;
          }).join(',')
        ),
      ];

      return new NextResponse(csvRows.join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${dataset.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv"`,
        },
      });
    }

    return new NextResponse(JSON.stringify(parsedData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${dataset.name.replace(/[^a-zA-Z0-9]/g, '_')}.json"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/datasets/[id]/export:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
