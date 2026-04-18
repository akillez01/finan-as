'use client';

import { useState } from 'react';
import type { PreviewTransaction } from '@/types/finance';

export function useCsvPreview() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PreviewTransaction[]>([]);
  const [summary, setSummary] = useState({ totalRows: 0, duplicatedRows: 0 });

  async function preview(csvContent: string) {
    setLoading(true);
    try {
      const response = await fetch('/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent }),
      });
      const data = await response.json();
      setItems(data.items ?? []);
      setSummary({ totalRows: data.totalRows ?? 0, duplicatedRows: data.duplicatedRows ?? 0 });
    } finally {
      setLoading(false);
    }
  }

  return { loading, items, summary, preview };
}
