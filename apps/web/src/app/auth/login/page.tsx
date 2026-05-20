'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    const res = await signIn('credentials', { email, password, redirect: true, callbackUrl: '/app' });
    if (res?.error) setError('E-mail ou senha inválidos.');
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Entrar</h1>
      <p className="mt-1 text-sm text-zinc-600">Acesse sua conta para emitir NFS-e.</p>

      <form action={onSubmit} className="mt-6 space-y-4">
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
            autoComplete="current-password"
            required
            minLength={8}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="h-11 w-full rounded-xl bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          type="submit"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600">
        Ainda não tem conta?{' '}
        <Link className="font-medium text-zinc-900 underline underline-offset-4" href="/auth/register">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

