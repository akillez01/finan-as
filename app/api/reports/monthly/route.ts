import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireSession();
  const month = req.nextUrl.searchParams.get('month') ?? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [year, mm] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, mm - 1, 1));
  const end = new Date(Date.UTC(year, mm, 0, 23, 59, 59));

  const items = await prisma.transaction.findMany({
    where: { userId: session.user.id, transactionDate: { gte: start, lte: end } },
    include: { category: true },
    orderBy: { amount: 'desc' },
  });

  const expenses = items.filter((i) => i.type === 'EXPENSE' && !i.isInternalTransfer);

  return NextResponse.json({
    month,
    totalEntries: items.filter((i) => i.type === 'INCOME' || i.type === 'REFUND').reduce((a, b) => a + Number(b.amount), 0),
    totalExits: expenses.reduce((a, b) => a + Number(b.amount), 0),
    biggestExpenses: expenses.slice(0, 10),
    peopleTransfers: items.filter((i) => i.category.name === 'Transferência para pessoa').reduce((a, b) => a + Number(b.amount), 0),
    foodTotal: items.filter((i) => i.category.name === 'Alimentação').reduce((a, b) => a + Number(b.amount), 0),
    telecomTotal: items.filter((i) => i.category.name === 'Telecom').reduce((a, b) => a + Number(b.amount), 0),
  });
}
