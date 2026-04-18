'use client';

import { useEffect, useState } from 'react';

export default function ReportsPage() {
  const [month, setMonth] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(defaultMonth);
  }, []);

  async function loadReport(monthRef: string) {
    const res = await fetch(`/api/reports/monthly?month=${monthRef}`);
    setData(await res.json());
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Relatórios</h1>
      <div className="rounded-xl border bg-white p-4">
        <div className="flex gap-2">
          <input value={month} onChange={(e) => setMonth(e.target.value)} className="h-10 rounded-md border px-2" placeholder="2026-04" />
          <button className="rounded-md bg-blue-600 px-3 text-white" onClick={() => loadReport(month)}>Gerar</button>
          <a href="/api/reports/export-csv" className="rounded-md border px-3 py-2">Exportar CSV</a>
        </div>
        {data ? (
          <div className="mt-3 space-y-1 text-sm">
            <p>Total entradas: R$ {Number(data.totalEntries).toFixed(2)}</p>
            <p>Total saídas: R$ {Number(data.totalExits).toFixed(2)}</p>
            <p>Gasto com pessoas: R$ {Number(data.peopleTransfers).toFixed(2)}</p>
            <p>Gasto com alimentação: R$ {Number(data.foodTotal).toFixed(2)}</p>
            <p>Gasto com telecom: R$ {Number(data.telecomTotal).toFixed(2)}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
