import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

export async function GET() {
  const session = await requireSession();
  const items = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: { account: true, category: true },
    orderBy: { transactionDate: 'desc' },
  });

  const header = 'Data,Descrição,Tipo,Valor,Categoria,Conta\n';
  const rows = items
    .map((item) => `${item.transactionDate.toISOString().slice(0, 10)},"${item.description.replaceAll('"', "'")}",${item.type},${Number(item.amount).toFixed(2)},${item.category.name},${item.account.name}`)
    .join('\n');

  return new NextResponse(header + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="relatorio-financeiro.csv"',
    },
  });
}
