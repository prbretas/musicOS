/**
 * Métricas: validação dos eventos que chegam em /api/track e leitura da
 * região pelos cabeçalhos da hospedagem (Vercel ou Cloudflare).
 *
 * Nada de IP, e-mail ou texto livre: só nomes de evento conhecidos,
 * propriedades curtas e a localização aproximada que a hospedagem informa.
 */

export const EVENT_NAMES = new Set([
  'page_view',
  'area_view',
  'click',
  'paywall',
  'upgrade_open',
  'checkout_start',
  'signup',
  'login',
  'scale_change',
  'instrument_change',
  'tuning_change',
  'practice_play',
  'tool_open',
]);

export const MAX_BATCH = 25;
const MAX_PROP_KEYS = 6;
const MAX_PROP_LEN = 60;

export interface IncomingEvent {
  name: string;
  props: Record<string, string | number | boolean>;
  path: string | null;
  ts: number | null;
}

export interface TrackContext {
  visitorId: string;
  sessionId: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
}

const ID_RE = /^[A-Za-z0-9-]{8,64}$/;
const KEY_RE = /^[a-z_]{1,24}$/;

function cleanText(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  // remove caracteres de controle
  const t = Array.from(v)
    .filter((ch) => ch.charCodeAt(0) >= 32)
    .join('')
    .trim()
    .slice(0, max);
  return t || null;
}

/** Só o domínio de quem indicou (sem caminho nem parâmetros) */
export function referrerHost(v: unknown, ownHost: string | null): string | null {
  const s = cleanText(v, 300);
  if (!s) return null;
  try {
    const host = new URL(s).hostname.replace(/^www\./, '');
    if (!host || (ownHost && host === ownHost.replace(/^www\./, '').split(':')[0])) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

/** Caminho sem parâmetros de URL (que podem ter tokens e códigos) */
export function cleanPath(v: unknown): string | null {
  const s = cleanText(v, 200);
  if (!s || !s.startsWith('/')) return null;
  return s.split('?')[0].split('#')[0].slice(0, 200) || '/';
}

function cleanProps(v: unknown): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!v || typeof v !== 'object' || Array.isArray(v)) return out;
  for (const [k, val] of Object.entries(v as Record<string, unknown>).slice(0, MAX_PROP_KEYS)) {
    if (!KEY_RE.test(k)) continue;
    if (typeof val === 'string') {
      const t = cleanText(val, MAX_PROP_LEN);
      if (t) out[k] = t;
    } else if (typeof val === 'number' && Number.isFinite(val)) out[k] = Math.round(val * 100) / 100;
    else if (typeof val === 'boolean') out[k] = val;
  }
  return out;
}

/** Valida o corpo de /api/track. Retorna null se for inválido. */
export function parseTrackBody(
  body: unknown,
  ownHost: string | null
): { ctx: TrackContext; events: IncomingEvent[] } | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (typeof b.visitorId !== 'string' || !ID_RE.test(b.visitorId)) return null;
  if (!Array.isArray(b.events) || b.events.length === 0) return null;

  const events: IncomingEvent[] = [];
  for (const raw of b.events.slice(0, MAX_BATCH)) {
    if (!raw || typeof raw !== 'object') continue;
    const e = raw as Record<string, unknown>;
    if (typeof e.name !== 'string' || !EVENT_NAMES.has(e.name)) continue;
    const ts = typeof e.ts === 'number' && Number.isFinite(e.ts) ? e.ts : null;
    events.push({ name: e.name, props: cleanProps(e.props), path: cleanPath(e.path), ts });
  }
  if (!events.length) return null;

  return {
    ctx: {
      visitorId: b.visitorId,
      sessionId: typeof b.sessionId === 'string' && ID_RE.test(b.sessionId) ? b.sessionId : null,
      referrer: referrerHost(b.referrer, ownHost),
      utmSource: cleanText(b.utmSource, 80),
      utmCampaign: cleanText(b.utmCampaign, 120),
    },
    events,
  };
}

export interface Geo {
  country: string | null;
  region: string | null;
  city: string | null;
}

function decode(v: string | null): string | null {
  if (!v) return null;
  try {
    return decodeURIComponent(v).slice(0, 80) || null;
  } catch {
    return v.slice(0, 80);
  }
}

/** País/estado/cidade a partir dos cabeçalhos da Vercel ou da Cloudflare */
export function geoFromHeaders(h: Headers): Geo {
  const country = (h.get('x-vercel-ip-country') ?? h.get('cf-ipcountry'))?.toUpperCase() ?? null;
  return {
    country: country && /^[A-Z]{2}$/.test(country) && country !== 'XX' && country !== 'T1' ? country : null,
    region: decode(h.get('x-vercel-ip-country-region') ?? h.get('cf-region-code') ?? h.get('cf-region')),
    city: decode(h.get('x-vercel-ip-city') ?? h.get('cf-ipcity')),
  };
}

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch/i;

export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT_RE.test(userAgent);
}

export function deviceFromUA(ua: string | null): 'desktop' | 'mobile' {
  return ua && /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ? 'mobile' : 'desktop';
}

/**
 * Limite simples por visitante (em memória, por instância do servidor):
 * no máximo `max` eventos por minuto. Protege contra loops e abuso básico.
 */
export function createRateLimiter(max = 120, windowMs = 60_000) {
  const buckets = new Map<string, { start: number; count: number }>();
  return (key: string, n: number, now = Date.now()): boolean => {
    const b = buckets.get(key);
    if (!b || now - b.start > windowMs) {
      buckets.set(key, { start: now, count: n });
      if (buckets.size > 5000) buckets.clear();
      return n <= max;
    }
    b.count += n;
    return b.count <= max;
  };
}
