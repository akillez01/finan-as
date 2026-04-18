'use client';

import { useEffect, useState } from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { toCurrency } from '@/lib/utils';

type DashboardData = {
  balance: number;
  entries: number;
  exits: number;
  monthBalance: number;
  byCategory: Array<{ name: string; value: number }>;
  entriesVsExits: Array<{ label: string; value: number }>;
  dueBills: Array<{ id: string; title: string; amount: number; dueDate: string }>;
  goal: { targetAmount: number; progress: number } | null;
  recentTransactions: Array<{ id: string; description: string; amount: number; type: string }>;
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Carregando...</p>;

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-4">
        <Card><p className="text-xs">Saldo atual</p><p className="text-xl font-semibold">{toCurrency(data.balance)}</p></Card>
        <Card><p className="text-xs">Entradas mês</p><p className="text-xl font-semibold text-emerald-600">{toCurrency(data.entries)}</p></Card>
        <Card><p className="text-xs">Saídas mês</p><p className="text-xl font-semibold text-red-600">{toCurrency(data.exits)}</p></Card>
        <Card><p className="text-xs">Balanço mês</p><p className="text-xl font-semibold">{toCurrency(data.monthBalance)}</p></Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="h-72">
          <h3 className="mb-2 font-medium">Gastos por categoria</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={data.byCategory} dataKey="value" nameKey="name" outerRadius={100} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="h-72">
          <h3 className="mb-2 font-medium">Entradas vs Saídas</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.entriesVsExits}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-medium">Contas a vencer</h3>
          <ul className="space-y-2 text-sm">
            {data.dueBills.map((bill) => (
              <li key={bill.id}>{bill.title} - {toCurrency(bill.amount)}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-2 font-medium">Meta do mês</h3>
          {data.goal ? <p className="text-sm">Progresso: {data.goal.progress.toFixed(1)}%</p> : <p className="text-sm">Sem meta cadastrada.</p>}
        </Card>
      </section>
    </div>
  );
}
