'use client';

import { FormEvent, useEffect, useState } from 'react';

export default function AccountsPage() {
  const [items, setItems] = useState<Array<{ id: string; name: string; type: string; initialBalance: number }>>([]);

  const load = () => fetch('/api/accounts').then((r) => r.json()).then(setItems);
  useEffect(load, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fd.get('name'), type: fd.get('type'), initialBalance: Number(fd.get('initialBalance')) }),
    });
    e.currentTarget.reset();
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Contas / carteiras</h1>
      <form onSubmit={onSubmit} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-4">
        <input name="name" className="h-10 rounded-md border px-2" placeholder="Conta principal" required />
        <input name="type" className="h-10 rounded-md border px-2" placeholder="Banco / Carteira / Dinheiro" required />
        <input name="initialBalance" className="h-10 rounded-md border px-2" placeholder="Saldo inicial" type="number" step="0.01" required />
        <button className="rounded-md bg-blue-600 px-3 text-white">Salvar</button>
      </form>
      <ul className="rounded-xl border bg-white p-4 text-sm">
        {items.map((item) => <li key={item.id} className="border-b py-2">{item.name} ({item.type}) - R$ {Number(item.initialBalance).toFixed(2)}</li>)}
      </ul>
    </div>
  );
}
