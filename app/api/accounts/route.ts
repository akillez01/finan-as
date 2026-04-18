import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { accountSchema } from '@/lib/validations';

export async function GET() {
  const session = await requireSession();
  const accounts = await prisma.account.findMany({ where: { userId: session.user.id, isActive: true } });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = await req.json();
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });

  const account = await prisma.account.create({
    data: {
      ...parsed.data,
      initialBalance: new Prisma.Decimal(parsed.data.initialBalance),
      userId: session.user.id,
    },
  });

  return NextResponse.json(account, { status: 201 });
}
