# Emissor NFS-e (SaaS) — Base do Projeto

Plataforma SaaS moderna de emissão de **NFS-e** usando a **Focus NFe** como backend fiscal (assinatura, transmissão, autorização, XML).

## Stack (MVP → Escala)

- **Frontend**: Next.js (App Router) + React + Tailwind CSS
- **Backend (MVP)**: Route Handlers do Next.js (Node runtime), organizado em camadas e pronto para extrair para um serviço separado quando necessário
- **Linguagem**: Node.js + TypeScript (tipagem forte ponta-a-ponta)
- **Banco**: PostgreSQL + Prisma
- **Auth**: NextAuth (Credentials) + sessões em banco (sem JWT no client)
- **Logs**: Pino (`@emissor/logger`)
- **Integração fiscal**: client modular da Focus (`@emissor/focus`)
- **Deploy**: Vercel (monorepo pronto para Turborepo)

## Como rodar local

1. Subir Postgres:
   - `docker compose up -d`
2. Criar env:
   - copie `apps/web/.env.example` para `apps/web/.env`
3. Migrar banco:
   - `npm run db:migrate`
4. Rodar:
   - `npm run dev`

## Estrutura

- `apps/web` — UI + APIs (MVP)
- `packages/db` — Prisma schema + Prisma client compartilhado
- `packages/focus` — cliente HTTP da Focus NFe (emitir/consultar)
- `packages/logger` — logger estruturado (Pino)
- `packages/validators` — validações Zod compartilhadas

## Agendamentos (Polling)

`apps/web/vercel.json` define um cron a cada 5 minutos chamando `POST/GET /api/jobs/focus/poll`.

> Na Vercel, configure o **Root Directory** do projeto como `apps/web`.

## Próximos passos do MVP

- CRUD completo de clientes/serviços
- Emissão de NFS-e (criar rascunho → enviar Focus → polling/webhook → render DANFS-e próprio)
- Histórico + visualização + download PDF/XML + impressão
- Permissões (RBAC) por empresa e seleção de empresa ativa
