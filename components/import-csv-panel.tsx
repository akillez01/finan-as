'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCsvPreview } from '@/hooks/use-csv-preview';
import { toCurrency } from '@/lib/utils';

export function ImportCsvPanel() {
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('extrato.csv');
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [feedback, setFeedback] = useState('');
  const { items, summary, loading, preview } = useCsvPreview();

  useEffect(() => {
    fetch('/api/accounts').then((res) => res.json()).then(setAccounts);
  }, []);

  async function confirm() {
    const response = await fetch('/api/import/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, fileName, items }),
    });
    const result = await response.json();
    setFeedback(`Importado: ${result.importedCount} | Duplicados: ${result.skippedCount}`);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-white p-4">
        <h3 className="font-medium">Upload do extrato CSV</h3>
        <p className="text-sm text-slate-600">Cole o conteúdo do CSV (Data, Descrição, Tipo, Valor, Saldo opcional).</p>
        <input
          type="file"
          accept=".csv"
          className="mt-3"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setFileName(file.name);
            setCsvContent(await file.text());
          }}
        />
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-3 h-10 w-full rounded-md border px-2">
          <option value="">Selecione a conta</option>
          {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
        </select>
        <div className="mt-3 flex gap-2">
          <Button onClick={() => preview(csvContent)} disabled={!csvContent || loading}>Gerar preview</Button>
          <Button variant="outline" onClick={confirm} disabled={!accountId || items.length === 0}>Confirmar importação</Button>
        </div>
        {feedback ? <p className="mt-2 text-sm text-emerald-700">{feedback}</p> : null}
      </div>

      <div className="rounded-xl border bg-white p-4">
        <p className="text-sm">Linhas: {summary.totalRows} | Duplicadas: {summary.duplicatedRows}</p>
        <div className="mt-2 max-h-96 overflow-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="text-left"><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.importHash} className="border-t">
                  <td>{new Date(item.transactionDate).toLocaleDateString('pt-BR')}</td>
                  <td>{item.description}</td>
                  <td>{item.categoryName}</td>
                  <td>{item.detectedType}</td>
                  <td>{toCurrency(item.amount)}</td>
                  <td>{item.duplicate ? 'Duplicado' : 'Novo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
