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

    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        dataPoints: true,
      },
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    const data = dataset.dataPoints.map((dp) => {
      try {
        return JSON.parse(dp.data);
      } catch {
        return {};
      }
    });

    if (format === 'csv') {
      if (data.length === 0) {
        return new NextResponse('', {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="dataset-${id}.csv"`,
          },
        });
      }

      const headerKeys = Object.keys(data[0] as object);
      const csvRows = [
        headerKeys.join(','),
        ...data.map((row: Record<string, unknown>) =>
          headerKeys
            .map((header) => {
              const value = row[header] === null || row[header] === undefined ? '' : String(row[header]);
              return `"${value.replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ];

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="dataset-${id}.csv"`,
        },
      });
    }

    // Default to JSON
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dataset-${id}.json"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/datasets/[id]/export:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
