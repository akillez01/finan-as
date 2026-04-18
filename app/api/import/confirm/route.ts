import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import type { PreviewTransaction } from '@/types/finance';

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = await req.json();
  const fileName = String(body.fileName ?? 'extrato.csv');
  const accountId = String(body.accountId ?? '');
  const items = (body.items ?? []) as PreviewTransaction[];

  if (!accountId || items.length === 0) {
    return NextResponse.json({ message: 'Conta e itens são obrigatórios' }, { status: 400 });
  }

  const batch = await prisma.importBatch.create({
    data: {
      userId: session.user.id,
      fileName,
      rawCount: items.length,
      importedCount: 0,
      skippedCount: 0,
    },
  });

  const categories = await prisma.category.findMany({ where: { userId: session.user.id, isActive: true } });

  let importedCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    const exists = await prisma.transaction.findUnique({
      where: { userId_importHash: { userId: session.user.id, importHash: item.importHash } },
      select: { id: true },
    });

    if (exists || item.duplicate) {
      skippedCount += 1;
      await prisma.importItem.create({
        data: {
          importBatchId: batch.id,
          lineNumber: item.lineNumber,
          importHash: item.importHash,
          status: 'SKIPPED_DUPLICATE',
          rawData: item,
          transactionId: exists?.id,
        },
      });
      continue;
    }

    const category = categories.find((entry) => entry.name === item.categoryName) ?? categories.find((entry) => entry.name === 'Outros');

    if (!category) {
      skippedCount += 1;
      continue;
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        accountId,
        categoryId: category.id,
        type: item.detectedType,
        method: item.method,
        description: item.description,
        amount: new Prisma.Decimal(item.amount),
        transactionDate: new Date(item.transactionDate),
        isInternalTransfer: item.isInternalTransfer,
        sourceFile: fileName,
        importHash: item.importHash,
      },
    });

    await prisma.importItem.create({
      data: {
        importBatchId: batch.id,
        transactionId: transaction.id,
        lineNumber: item.lineNumber,
        importHash: item.importHash,
        status: 'IMPORTED',
        rawData: item,
      },
    });

    importedCount += 1;
  }

  const result = await prisma.importBatch.update({
    where: { id: batch.id },
    data: { importedCount, skippedCount },
  });

  return NextResponse.json(result);
}
