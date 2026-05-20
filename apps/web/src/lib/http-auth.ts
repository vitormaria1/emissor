import crypto from 'crypto';

export function requireBasicAuth(
  req: Request,
  expectedUser: string,
  expectedPass: string,
): { ok: true } | { ok: false; status: number } {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Basic ')) return { ok: false, status: 401 };

  const base64 = header.slice('Basic '.length);
  const decoded = Buffer.from(base64, 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');

  const userOk = safeEqual(user ?? '', expectedUser);
  const passOk = safeEqual(pass ?? '', expectedPass);

  return userOk && passOk ? { ok: true } : { ok: false, status: 403 };
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

