import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { categorySchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await requireSession();
    const items = await prisma.category.findMany({ where: { userId: session.user.id }, orderBy: { name: 'asc' } });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });
    const item = await prisma.category.create({ data: { ...parsed.data, userId: session.user.id } });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Erro' }, { status: 500 });
  }
}
