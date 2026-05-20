'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? 'Não foi possível criar sua conta.');
      setLoading(false);
      return;
    }

    await signIn('credentials', { email, password, redirect: true, callbackUrl: '/app' });
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Criar conta</h1>
      <p className="mt-1 text-sm text-zinc-600">Comece emitindo NFS-e em minutos.</p>

      <form action={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="name">
            Nome
          </label>
          <input
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">
            E-mail
          </label>
          <input
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="password">
            Senha
          </label>
          <input
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="text-xs text-zinc-500">Mínimo de 8 caracteres.</p>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          type="submit"
        >
          {loading ? 'Criando…' : 'Criar conta'}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600">
        Já tem conta?{' '}
        <Link className="font-medium text-zinc-900 underline underline-offset-4" href="/auth/login">
          Entrar
        </Link>
      </p>
    </div>
  );
}

