import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { transactionSchema } from '@/lib/validations';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });

    const updated = await prisma.transaction.updateMany({
      where: { id: params.id, userId: session.user.id },
      data: {
        ...parsed.data,
        amount: new Prisma.Decimal(parsed.data.amount),
        transactionDate: new Date(parsed.data.transactionDate),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    await prisma.transaction.deleteMany({ where: { id: params.id, userId: session.user.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: 'Erro ao excluir' }, { status: 500 });
  }
}
