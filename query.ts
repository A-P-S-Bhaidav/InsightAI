import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const task = await prisma.task.findFirst({ orderBy: { createdAt: 'desc' }, include: { workflows: { include: { steps: true } } } });
  console.log(JSON.stringify(task, null, 2));
}
main().finally(() => prisma.$disconnect());
