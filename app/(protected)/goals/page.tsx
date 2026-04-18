'use client';

import { FormEvent, useEffect, useState } from 'react';

export default function GoalsPage() {
  const [items, setItems] = useState<Array<{ id: string; name: string; targetAmount: number; monthRef: string }>>([]);

  const load = () => fetch('/api/goals').then((r) => r.json()).then(setItems);
  useEffect(load, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        targetAmount: Number(fd.get('targetAmount')),
        monthRef: fd.get('monthRef'),
      }),
    });
    e.currentTarget.reset();
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Metas financeiras</h1>
      <form onSubmit={onSubmit} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-3">
        <input name="name" className="h-10 rounded-md border px-2" placeholder="Meta mensal de economia" required />
        <input name="targetAmount" className="h-10 rounded-md border px-2" placeholder="Valor da meta" type="number" step="0.01" required />
        <input name="monthRef" className="h-10 rounded-md border px-2" placeholder="2026-04" required />
        <button className="rounded-md bg-blue-600 px-3 text-white">Salvar</button>
      </form>
      <ul className="rounded-xl border bg-white p-4 text-sm">
        {items.map((item) => <li key={item.id} className="border-b py-2">{item.monthRef} - {item.name} - R$ {Number(item.targetAmount).toFixed(2)}</li>)}
      </ul>
    </div>
  );
}
