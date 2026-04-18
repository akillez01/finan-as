import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { buildImportHash } from '@/services/import-hash';
import { inferFromDescription } from '@/services/categorization';
import type { CsvBankRow, PreviewTransaction } from '@/types/finance';

function parseBrazilAmount(raw: string) {
  const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  return Number(normalized);
}

function parseBankDate(raw: string) {
  const [day, month, year] = raw.split('/').map(Number);
  if (day && month && year) {
    return new Date(Date.UTC(year, month - 1, day));
  }
  return new Date(raw);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = await req.json();
  const csvContent = String(body.csvContent ?? '');

  const parsed = Papa.parse<CsvBankRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json({ message: 'CSV inválido', errors: parsed.errors }, { status: 400 });
  }

  const previewItems: PreviewTransaction[] = [];

  for (const [index, row] of parsed.data.entries()) {
    const lineNumber = index + 2;
    const description = String(row.Descricao ?? row['Descrição'] ?? '').trim();
    const dateRaw = String(row.Data ?? '').trim();
    const valueRaw = String(row.Valor ?? '0').trim();
    const typeRaw = String(row.Tipo ?? '').trim();

    if (!description || !dateRaw) continue;

    const amount = Math.abs(parseBrazilAmount(valueRaw));
    const date = parseBankDate(dateRaw);
    const inferred = inferFromDescription(description, typeRaw);

    const importHash = buildImportHash({
      date: date.toISOString().slice(0, 10),
      description,
      amount,
      type: inferred.type,
    });

    const exists = await prisma.transaction.findUnique({
      where: { userId_importHash: { userId: session.user.id, importHash } },
      select: { id: true },
    });

    previewItems.push({
      lineNumber,
      description,
      amount,
      transactionDate: date.toISOString(),
      detectedType: inferred.type,
      method: inferred.method,
      categoryName: inferred.categoryName,
      isInternalTransfer: inferred.isInternalTransfer,
      importHash,
      duplicate: Boolean(exists),
    });
  }

  return NextResponse.json({
    columnsDetected: parsed.meta.fields ?? [],
    totalRows: previewItems.length,
    duplicatedRows: previewItems.filter((item) => item.duplicate).length,
    items: previewItems,
  });
}
