// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  cleanPath,
  createRateLimiter,
  deviceFromUA,
  geoFromHeaders,
  isBot,
  parseTrackBody,
  referrerHost,
} from '@/lib/analytics/server';

const VID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('validação de /api/track', () => {
  it('aceita um lote válido e limpa as propriedades', () => {
    const r = parseTrackBody(
      {
        visitorId: VID,
        sessionId: VID,
        referrer: 'https://www.instagram.com/p/abc?x=1',
        utmSource: 'instagram',
        events: [
          { name: 'paywall', props: { feature: 'tuner', 'bad key': 'x', obj: { a: 1 } }, path: '/?code=segredo#braco', ts: 1 },
          { name: 'inventado', props: {} },
        ],
      },
      'musicos.app'
    )!;
    expect(r.events).toHaveLength(1);
    expect(r.events[0]).toEqual({ name: 'paywall', props: { feature: 'tuner' }, path: '/', ts: 1 });
    expect(r.ctx.referrer).toBe('instagram.com');
    expect(r.ctx.utmSource).toBe('instagram');
  });

  it('rejeita id inválido, lote vazio ou só eventos desconhecidos', () => {
    expect(parseTrackBody({ visitorId: 'x', events: [{ name: 'click' }] }, null)).toBeNull();
    expect(parseTrackBody({ visitorId: VID, events: [] }, null)).toBeNull();
    expect(parseTrackBody({ visitorId: VID, events: [{ name: 'drop table' }] }, null)).toBeNull();
    expect(parseTrackBody('lixo', null)).toBeNull();
  });

  it('no máximo 25 eventos por envio e textos curtos', () => {
    const events = Array.from({ length: 40 }, () => ({ name: 'click', props: { target: 'x'.repeat(500) } }));
    const r = parseTrackBody({ visitorId: VID, events }, null)!;
    expect(r.events).toHaveLength(25);
    expect(String(r.events[0].props.target).length).toBeLessThanOrEqual(60);
  });

  it('referência do próprio site não conta como origem', () => {
    expect(referrerHost('https://musicos.app/pricing', 'musicos.app')).toBeNull();
    expect(referrerHost('javascript:alert(1)', null)).toBeNull();
  });

  it('caminho nunca leva parâmetros (podem ter tokens)', () => {
    expect(cleanPath('/auth/callback?code=abc')).toBe('/auth/callback');
    expect(cleanPath('https://evil.com')).toBeNull();
  });
});

describe('região, aparelho e robôs', () => {
  it('lê os cabeçalhos da Vercel', () => {
    const g = geoFromHeaders(
      new Headers({ 'x-vercel-ip-country': 'BR', 'x-vercel-ip-country-region': 'SP', 'x-vercel-ip-city': 'S%C3%A3o%20Paulo' })
    );
    expect(g).toEqual({ country: 'BR', region: 'SP', city: 'São Paulo' });
  });
  it('lê o país da Cloudflare e ignora códigos inválidos', () => {
    expect(geoFromHeaders(new Headers({ 'cf-ipcountry': 'pt' })).country).toBe('PT');
    expect(geoFromHeaders(new Headers({ 'cf-ipcountry': 'XX' })).country).toBeNull();
    expect(geoFromHeaders(new Headers()).country).toBeNull();
  });
  it('robôs e aparelhos', () => {
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(isBot('Mozilla/5.0 (Windows NT 10.0) Chrome/131')).toBe(false);
    expect(deviceFromUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5)')).toBe('mobile');
    expect(deviceFromUA('Mozilla/5.0 (Windows NT 10.0)')).toBe('desktop');
  });
  it('limite de eventos por minuto', () => {
    const allow = createRateLimiter(5, 60_000);
    expect(allow('v', 3, 0)).toBe(true);
    expect(allow('v', 3, 1000)).toBe(false);
    expect(allow('v', 3, 70_000)).toBe(true);
  });
});
