'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Option = { id: string; name: string };

export function TransactionForm({ onCreated }: { onCreated: () => void }) {
  const [categories, setCategories] = useState<Option[]>([]);
  const [accounts, setAccounts] = useState<Option[]>([]);

  useEffect(() => {
    fetch('/api/categories').then((res) => res.json()).then(setCategories);
    fetch('/api/accounts').then((res) => res.json()).then(setAccounts);
  }, []);

  async function submit(formData: FormData) {
    const body = {
      accountId: formData.get('accountId'),
      categoryId: formData.get('categoryId'),
      type: formData.get('type'),
      method: formData.get('method'),
      description: formData.get('description'),
      amount: Number(formData.get('amount')),
      transactionDate: new Date(String(formData.get('transactionDate'))).toISOString(),
      notes: formData.get('notes') || undefined,
      isInternalTransfer: Boolean(formData.get('isInternalTransfer')),
    };

    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    onCreated();
  }

  return (
    <form
      className="grid gap-2 rounded-xl border bg-white p-4"
      action={async (formData) => {
        await submit(formData);
      }}
    >
      <h3 className="font-medium">Nova transação</h3>
      <select name="accountId" className="h-10 rounded-md border px-2" required>
        <option value="">Conta</option>
        {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
      </select>
      <select name="categoryId" className="h-10 rounded-md border px-2" required>
        <option value="">Categoria</option>
        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
      </select>
      <select name="type" className="h-10 rounded-md border px-2" defaultValue="EXPENSE">
        <option value="INCOME">Entrada</option>
        <option value="EXPENSE">Saída</option>
        <option value="TRANSFER">Transferência</option>
        <option value="REFUND">Devolução</option>
      </select>
      <select name="method" className="h-10 rounded-md border px-2" defaultValue="MANUAL">
        <option value="MANUAL">Manual</option>
        <option value="PIX">Pix</option>
        <option value="QR_CODE">QR Code</option>
        <option value="TRANSFER">Transferência</option>
        <option value="OTHER">Outros</option>
      </select>
      <Input name="description" placeholder="Descrição" required />
      <Input name="amount" type="number" step="0.01" placeholder="Valor" required />
      <Input name="transactionDate" type="datetime-local" required />
      <Input name="notes" placeholder="Observação" />
      <label className="text-sm"><input name="isInternalTransfer" type="checkbox" /> Transferência interna</label>
      <Button type="submit">Salvar</Button>
    </form>
  );
}
