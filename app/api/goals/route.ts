import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { goalSchema } from '@/lib/validations';

export async function GET() {
  const session = await requireSession();
  const goals = await prisma.goal.findMany({ where: { userId: session.user.id }, orderBy: { monthRef: 'desc' } });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = await req.json();
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });

  const created = await prisma.goal.create({
    data: { ...parsed.data, targetAmount: new Prisma.Decimal(parsed.data.targetAmount), userId: session.user.id },
  });

  return NextResponse.json(created, { status: 201 });
}
