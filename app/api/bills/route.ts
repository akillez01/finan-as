import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { billSchema } from '@/lib/validations';

export async function GET() {
  const session = await requireSession();
  const items = await prisma.bill.findMany({ where: { userId: session.user.id }, orderBy: { dueDate: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = await req.json();
  const parsed = billSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });

  const created = await prisma.bill.create({
    data: {
      ...parsed.data,
      amount: new Prisma.Decimal(parsed.data.amount),
      dueDate: new Date(parsed.data.dueDate),
      userId: session.user.id,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
