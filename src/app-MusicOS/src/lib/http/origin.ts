/**
 * Endereço público da requisição (ex.: http://localhost:3000).
 *
 * No container o Next escuta em 0.0.0.0, e `request.url` sai como
 * http://0.0.0.0:3000 — endereço que o navegador não abre. Por isso o
 * endereço vem do cabeçalho Host (ou X-Forwarded-Host atrás de proxy),
 * que é o que o usuário digitou.
 */
export function publicOrigin(headers: Headers, fallbackUrl: string): string {
  const host = (headers.get('x-forwarded-host') ?? headers.get('host'))?.split(',')[0]?.trim();
  const fallback = new URL(fallbackUrl);
  if (!host || host.startsWith('0.0.0.0')) {
    const env = process.env.NEXT_PUBLIC_APP_URL;
    if (env) return env.replace(/\/$/, '');
    return fallback.origin.replace('0.0.0.0', 'localhost');
  }
  const proto = headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || fallback.protocol.replace(':', '');
  return `${proto}://${host}`;
}
