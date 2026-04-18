import { Prisma } from '@prisma/client';
import { endOfMonth, startOfMonth } from 'date-fns';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

export async function GET() {
  const session = await requireSession();
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  const [accounts, monthTransactions, recentTransactions, dueBills, goal] = await Promise.all([
    prisma.account.findMany({ where: { userId: session.user.id, isActive: true } }),
    prisma.transaction.findMany({
      where: { userId: session.user.id, transactionDate: { gte: start, lte: end } },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { transactionDate: 'desc' },
      take: 7,
    }),
    prisma.bill.findMany({
      where: { userId: session.user.id, status: 'PENDING', dueDate: { gte: new Date(), lte: end } },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    prisma.goal.findFirst({ where: { userId: session.user.id, monthRef: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` } }),
  ]);

  const entries = monthTransactions
    .filter((item) => item.type === 'INCOME' || item.type === 'REFUND')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const exits = monthTransactions
    .filter((item) => item.type === 'EXPENSE' && !item.isInternalTransfer)
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const accountBase = accounts.reduce((sum, account) => sum + Number(account.initialBalance), 0);
  const transactionEffect = monthTransactions.reduce((sum, t) => {
    if (t.type === 'INCOME' || t.type === 'REFUND') return sum + Number(t.amount);
    return sum - Number(t.amount);
  }, 0);

  const byCategory = monthTransactions.reduce<Record<string, number>>((acc, item) => {
    if (item.type !== 'EXPENSE' || item.isInternalTransfer) return acc;
    acc[item.category.name] = (acc[item.category.name] ?? 0) + Number(item.amount);
    return acc;
  }, {});

  const spent = exits;
  const goalTarget = goal ? Number(goal.targetAmount) : 0;

  return NextResponse.json({
    balance: accountBase + transactionEffect,
    entries,
    exits,
    monthBalance: entries - exits,
    byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
    entriesVsExits: [
      { label: 'Entradas', value: entries },
      { label: 'Saídas', value: exits },
    ],
    recentTransactions,
    dueBills,
    goal: goal
      ? {
          ...goal,
          targetAmount: goalTarget,
          progress: goalTarget > 0 ? Math.max(0, ((goalTarget - spent) / goalTarget) * 100) : 0,
        }
      : null,
  });
}
