import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { transactionSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 20);
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const accountId = searchParams.get('accountId');
    const q = searchParams.get('q');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
      ...(type ? { type: type as never } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(accountId ? { accountId } : {}),
      ...(q ? { description: { contains: q, mode: 'insensitive' } } : {}),
      ...(from || to
        ? {
            transactionDate: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true, account: true },
        orderBy: { transactionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Payload inválido', issues: parsed.error.issues }, { status: 400 });
    }

    const created = await prisma.transaction.create({
      data: {
        ...parsed.data,
        transactionDate: new Date(parsed.data.transactionDate),
        amount: new Prisma.Decimal(parsed.data.amount),
        userId: session.user.id,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Erro ao criar transação' }, { status: 500 });
  }
}
