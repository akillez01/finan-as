import { createHash } from 'crypto';

export function buildImportHash(params: { date: string; description: string; amount: number; type: string }) {
  const payload = `${params.date}|${params.description.trim().toUpperCase()}|${params.amount.toFixed(2)}|${params.type}`;
  return createHash('sha256').update(payload).digest('hex');
}
