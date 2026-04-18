import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

export async function GET() {
  const session = await requireSession();
  const categories = await prisma.category.findMany({ where: { userId: session.user.id }, include: { _count: { select: { transactions: true } } } });
  return NextResponse.json(categories);
}
