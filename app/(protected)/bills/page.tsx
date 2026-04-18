'use client';

import { FormEvent, useEffect, useState } from 'react';

export default function BillsPage() {
  const [items, setItems] = useState<Array<{ id: string; title: string; amount: number; dueDate: string; status: string }>>([]);

  const load = () => fetch('/api/bills').then((r) => r.json()).then(setItems);
  useEffect(load, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: fd.get('title'),
        amount: Number(fd.get('amount')),
        dueDate: new Date(String(fd.get('dueDate'))).toISOString(),
        kind: fd.get('kind'),
        status: 'PENDING',
        recurrence: fd.get('recurrence') || undefined,
      }),
    });
    e.currentTarget.reset();
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Contas a pagar / receber</h1>
      <form onSubmit={onSubmit} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-3">
        <input name="title" className="h-10 rounded-md border px-2" placeholder="Conta de luz" required />
        <input name="amount" className="h-10 rounded-md border px-2" placeholder="Valor" type="number" step="0.01" required />
        <input name="dueDate" className="h-10 rounded-md border px-2" type="datetime-local" required />
        <select name="kind" className="h-10 rounded-md border px-2"><option value="PAYABLE">Pagar</option><option value="RECEIVABLE">Receber</option></select>
        <input name="recurrence" className="h-10 rounded-md border px-2" placeholder="mensal (opcional)" />
        <button className="rounded-md bg-blue-600 px-3 text-white">Cadastrar</button>
      </form>
      <ul className="rounded-xl border bg-white p-4 text-sm">
        {items.map((item) => <li key={item.id} className="border-b py-2">{item.title} - R$ {Number(item.amount).toFixed(2)} - vence {new Date(item.dueDate).toLocaleDateString('pt-BR')} ({item.status})</li>)}
      </ul>
    </div>
  );
}
