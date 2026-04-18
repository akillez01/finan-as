'use client';

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));

    const result = await signIn('credentials', { email, password, callbackUrl: '/dashboard', redirect: false });
    if (result?.error) {
      setError('Credenciais inválidas');
      return;
    }

    window.location.href = '/dashboard';
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center justify-center p-4">
      <form className="w-full space-y-4 rounded-xl border bg-white p-6" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">Entrar no Finan.as</h1>
        <Input name="email" type="email" placeholder="seu@email.com" required />
        <Input name="password" type="password" placeholder="Senha" required />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <Button type="submit" className="w-full">Entrar</Button>
      </form>
    </main>
  );
}
