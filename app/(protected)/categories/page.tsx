'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CategoriesPage() {
  const [items, setItems] = useState<Array<{ id: string; name: string; type: string; isActive: boolean }>>([]);

  const load = () => fetch('/api/categories').then((r) => r.json()).then(setItems);
  useEffect(load, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fd.get('name'), type: fd.get('type'), color: '#2563eb' }),
    });
    e.currentTarget.reset();
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Categorias</h1>
      <form onSubmit={onSubmit} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-4">
        <Input name="name" placeholder="Nome" required />
        <select name="type" className="h-10 rounded-md border px-2"><option value="EXPENSE">Despesa</option><option value="INCOME">Receita</option><option value="TRANSFER">Transferência</option><option value="REFUND">Reembolso</option></select>
        <Button type="submit">Criar</Button>
      </form>
      <ul className="rounded-xl border bg-white p-4 text-sm">
        {items.map((item) => <li key={item.id} className="border-b py-2">{item.name} ({item.type}) {item.isActive ? 'Ativa' : 'Inativa'}</li>)}
      </ul>
    </div>
  );
}
