import Link from 'next/link';
import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

const links = [
  ['Dashboard', '/dashboard'],
  ['Transações', '/transactions'],
  ['Importar CSV', '/import'],
  ['Categorias', '/categories'],
  ['Contas', '/accounts'],
  ['Contas a pagar', '/bills'],
  ['Metas', '/goals'],
  ['Relatórios', '/reports'],
  ['Configurações', '/settings'],
];

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-3 p-4 text-sm">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-1 hover:bg-slate-100">
              {label}
            </Link>
          ))}
          <form action="/api/auth/signout" method="post" className="ml-auto">
            <button className="rounded-md border px-3 py-1">Sair</button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
