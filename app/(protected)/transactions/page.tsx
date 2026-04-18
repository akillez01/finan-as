'use client';

import { useEffect, useState } from 'react';
import { TransactionForm } from '@/components/transaction-form';
import { Table } from '@/components/ui/table';
import { toCurrency } from '@/lib/utils';

type Row = {
  id: string;
  transactionDate: string;
  description: string;
  amount: number;
  type: string;
  category: { name: string };
  account: { name: string };
};

export default function TransactionsPage() {
  const [rows, setRows] = useState<Row[]>([]);

  const load = () => {
    fetch('/api/transactions?limit=50')
      .then((res) => res.json())
      .then((data) => setRows(data.items ?? []));
  };

  useEffect(load, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transações</h1>
      <TransactionForm onCreated={load} />
      <div className="rounded-xl border bg-white p-3">
        <Table>
          <thead>
            <tr className="text-left">
              <th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th>Tipo</th><th className="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td>{new Date(row.transactionDate).toLocaleDateString('pt-BR')}</td>
                <td>{row.description}</td>
                <td>{row.category.name}</td>
                <td>{row.account.name}</td>
                <td>{row.type}</td>
                <td className="text-right">{toCurrency(Number(row.amount))}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
