// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { publicOrigin } from '@/lib/http/origin';

const h = (o: Record<string, string>) => new Headers(o);

describe('endereço público da requisição', () => {
  it('usa o Host que o navegador mandou, não o 0.0.0.0 do container', () => {
    expect(publicOrigin(h({ host: 'localhost:3000' }), 'http://0.0.0.0:3000/auth/callback?code=x')).toBe('http://localhost:3000');
  });
  it('atrás de proxy usa X-Forwarded-Host e X-Forwarded-Proto', () => {
    expect(
      publicOrigin(h({ host: '10.0.0.5:3000', 'x-forwarded-host': 'musicos.app', 'x-forwarded-proto': 'https' }), 'http://0.0.0.0:3000/')
    ).toBe('https://musicos.app');
  });
  it('sem Host válido cai no NEXT_PUBLIC_APP_URL', () => {
    expect(publicOrigin(h({ host: '0.0.0.0:3000' }), 'http://0.0.0.0:3000/')).toBe('http://localhost:3000');
  });
});
