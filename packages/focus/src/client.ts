import { FocusAuth, FocusConsultResponse, FocusEmitResponse } from './types.js';

type FetchLike = typeof fetch;

const BASE_URL: Record<FocusAuth['environment'], string> = {
  PRODUCTION: 'https://api.focusnfe.com.br',
  HOMOLOGATION: 'https://homologacao.focusnfe.com.br',
};

function basicAuthHeader(token: string) {
  // Focus NFe: token como username (password em branco).
  const encoded = Buffer.from(`${token}:`).toString('base64');
  return `Basic ${encoded}`;
}

export class FocusClient {
  private readonly fetch: FetchLike;
  private readonly auth: FocusAuth;

  constructor(auth: FocusAuth, fetchImpl: FetchLike = fetch) {
    this.auth = auth;
    this.fetch = fetchImpl;
  }

  private url(path: string, query?: Record<string, string | undefined>) {
    const base = BASE_URL[this.auth.environment];
    const u = new URL(path, base);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v) u.searchParams.set(k, v);
      }
    }
    return u.toString();
  }

  async emitirNfse(reference: string, payload: unknown): Promise<FocusEmitResponse> {
    const res = await this.fetch(this.url('/v2/nfse', { ref: reference }), {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(this.auth.token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const json = text ? (JSON.parse(text) as unknown) : {};
    if (!res.ok) {
      throw new FocusHttpError(res.status, json);
    }
    return json as FocusEmitResponse;
  }

  async consultarNfse(reference: string): Promise<FocusConsultResponse> {
    const res = await this.fetch(this.url(`/v2/nfse/${encodeURIComponent(reference)}`), {
      method: 'GET',
      headers: {
        Authorization: basicAuthHeader(this.auth.token),
        'Content-Type': 'application/json',
      },
    });

    const text = await res.text();
    const json = text ? (JSON.parse(text) as unknown) : {};
    if (!res.ok) {
      throw new FocusHttpError(res.status, json);
    }
    return json as FocusConsultResponse;
  }
}

export class FocusHttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`Focus NFe HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

