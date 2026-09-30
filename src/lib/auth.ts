/**
 * auth.ts — Secure session helpers using HMAC-SHA256 signed tokens.
 *
 * Why: The old cookie value was simply "authenticated" — anyone who knew
 * this could forge the cookie. This module generates time-bound tokens that
 * are signed with SESSION_SECRET, so they cannot be forged without the key.
 */

const SESSION_SECRET = process.env.SESSION_SECRET!;
const SESSION_COOKIE = 'paos_admin_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Create a HMAC-SHA256 signature for a message */
async function hmacSign(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Buffer.from(sig).toString('hex');
}

/** Generate a new signed session token: `<expiresAt>.<signature>` */
export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `paos_admin:${expiresAt}`;
  const sig = await hmacSign(payload);
  return `${expiresAt}.${sig}`;
}

/** Verify a token; returns true only if signature is valid AND not expired */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !SESSION_SECRET) return false;
  try {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return false;
    const expiresAt = parseInt(token.slice(0, dotIndex), 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
    const payload = `paos_admin:${expiresAt}`;
    const expectedSig = await hmacSign(payload);
    const givenSig = token.slice(dotIndex + 1);
    // Constant-time comparison to prevent timing attacks
    return expectedSig === givenSig;
  } catch {
    return false;
  }
}

/** Read and verify the session cookie from Next.js cookie store */
export async function isAdminAuthenticated(): Promise<boolean> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export { SESSION_COOKIE };
