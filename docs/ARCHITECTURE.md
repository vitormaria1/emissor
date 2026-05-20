# Arquitetura proposta (SaaS NFS-e)

## Objetivos

- **Velocidade** no MVP sem comprometer evolução
- **Backend desacoplável** (mesmo se iniciar no Next)
- **Multi-tenant** por empresa com RBAC
- **Integração fiscal modular** com fila/polling/webhooks e retry

## Decisão de stack

### Web + API (MVP)

- **Next.js App Router**
  - UI moderna + SSR/Server Actions
  - APIs (route handlers) para emissão, webhooks e jobs
  - Facilita deploy na Vercel e acelera o MVP

### Evolução (quando crescer)

Extrair o backend fiscal/operacional para `apps/api` (Hono/Fastify em Node) mantendo:

- `packages/*` (db, validators, focus, logger)
- contrato HTTP estável

## Camadas (clean-ish)

- **UI** (`apps/web/src/app/**`)
- **Use-cases** (server actions / handlers) → validação Zod → autorização → transação DB
- **Infra** (`@emissor/db`, `@emissor/focus`, `@emissor/logger`)

## Multi-tenant e permissões

- Todas as entidades operacionais têm `companyId`.
- Usuário participa de empresas via `CompanyMember` (`OWNER|ADMIN|MEMBER|VIEWER`).
- MVP: empresa “ativa” pode ser a primeira membership; evolução: seleção + persistência (cookie/session).
- **Hardening** (futuro): Postgres RLS com `SET app.current_company_id` por request.

## Fluxo de emissão (alvo)

1. Usuário cria `Invoice` (rascunho) + itens
2. Backend monta payload Focus (por cidade/configuração)
3. Envia para Focus (`/v2/nfse?ref=...`) e salva payload/retorno
4. Marca nota como `QUEUED/PROCESSING`
5. Atualização por:
   - **Polling** (cron) consultando `GET /v2/nfse/{ref}`
   - **Webhook** (Focus → `/api/webhooks/focus`)
6. Com `AUTHORIZED`, renderizamos **DANFS-e próprio** (HTML → impressão/PDF)
7. Disponibiliza download PDF/XML (se disponível via Focus) e impressão

## Estratégia de retry / fila

MVP:

- Status no banco + job via Vercel Cron (`/api/jobs/focus/poll`)
- Erros de consulta/emissão não quebram UI: salvamos logs/retorno e reprocessamos no próximo ciclo

Evolução:

- Fila dedicada (ex: Upstash Redis + BullMQ) e worker separado
- Dead-letter + backoff exponencial + idempotência por `reference`

## Integração Focus NFe

- Tokens por empresa e ambiente: `FiscalConfiguration`
- `@emissor/focus` encapsula:
  - base URL (produção/homologação)
  - auth Basic (token como usuário)
  - emitir / consultar

## Infra Vercel

- `apps/web`: deploy único (MVP)
- DB recomendado: Postgres gerenciado (Neon/Supabase/RDS) com pooler
- Observabilidade: logs estruturados + tracing (futuro)

