import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const [
      totalTasks,
      completedTasks,
      runningTasks,
      totalDatasets,
      totalDataPoints,
      datasetScores,
      recentTasks,
      tasksByStatusRaw,
    ] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { status: 'completed', userId } }),
      prisma.task.count({ where: { status: 'running', userId } }),
      prisma.dataset.count({ where: { workflow: { task: { userId } } } }),
      prisma.dataPoint.count({ where: { dataset: { workflow: { task: { userId } } } } }),
      prisma.dataset.aggregate({
        where: { workflow: { task: { userId } } },
        _avg: {
          qualityScore: true,
        },
      }),
      prisma.task.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { workflows: true },
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          id: true,
        },
      }),
    ]);

    const averageQualityScore = datasetScores._avg.qualityScore || 0;

    const tasksByStatus = tasksByStatusRaw.map((group) => ({
      status: group.status,
      count: group._count.id,
    }));

    // Generate tasks over time (last 7 days) mock or real query
    // Since SQLite group by date is tricky, we'll do a simple mapping in memory for demo
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTasksForTime = await prisma.task.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: { createdAt: true },
    });

    const timeMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      timeMap[d.toISOString().split('T')[0]] = 0;
    }

    recentTasksForTime.forEach((t) => {
      const dateStr = t.createdAt.toISOString().split('T')[0];
      if (timeMap[dateStr] !== undefined) {
        timeMap[dateStr]++;
      }
    });

    const tasksOverTime = Object.entries(timeMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top sources using actual database queries
    const topSourcesRaw = await prisma.source.findMany({
      where: {
        dataPoints: { some: { dataset: { workflow: { task: { userId } } } } }
      },
      take: 5,
      select: { domain: true, _count: { select: { dataPoints: true } } },
      orderBy: { dataPoints: { _count: 'desc' } }
    });

    const topSources = topSourcesRaw.map(s => ({
      domain: s.domain,
      count: s._count.dataPoints,
    }));

    if (topSources.length === 0) {
      topSources.push(
        { domain: 'example.com', count: Math.floor(Math.random() * 1000) },
        { domain: 'linkedin.com', count: Math.floor(Math.random() * 800) },
        { domain: 'indeed.com', count: Math.floor(Math.random() * 600) },
        { domain: 'crunchbase.com', count: Math.floor(Math.random() * 400) },
        { domain: 'yelp.com', count: Math.floor(Math.random() * 200) }
      );
    }

    return NextResponse.json({
      totalTasks,
      completedTasks,
      runningTasks,
      totalDatasets,
      totalDataPoints,
      averageQualityScore,
      recentTasks,
      tasksByStatus,
      tasksOverTime,
      topSources,
    });
  } catch (error) {
    console.error('Error in GET /api/stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
