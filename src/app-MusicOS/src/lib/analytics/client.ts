/**
 * Métricas no navegador: fila de eventos enviada em lote para /api/track.
 *
 *  - id anônimo e aleatório por navegador (localStorage), sessão de 30 min
 *  - envia a cada 5 s, ou na hora em que a aba é escondida/fechada (sendBeacon)
 *  - respeita "Não rastrear" / Global Privacy Control do navegador
 *  - nunca envia texto digitado pelo usuário, só nomes de botões e áreas
 */

type Props = Record<string, string | number | boolean | undefined>;

interface QueuedEvent {
  name: string;
  props: Record<string, string | number | boolean>;
  path: string;
  ts: number;
}

const VID_KEY = 'musicos:vid';
const SID_KEY = 'musicos:sid';
const UTM_KEY = 'musicos:utm';
const SESSION_MS = 30 * 60_000;
const FLUSH_MS = 5_000;

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

function randomId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function analyticsDisabled(): boolean {
  if (typeof window === 'undefined') return true;
  if (process.env.NEXT_PUBLIC_ANALYTICS === 'off') return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
}

function visitorId(): string {
  try {
    let id = localStorage.getItem(VID_KEY);
    if (!id || id.length < 8 || id.length > 64) {
      id = randomId();
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch {
    return 'anon-' + randomId().slice(0, 12);
  }
}

function sessionId(): string {
  try {
    const raw = sessionStorage.getItem(SID_KEY);
    const now = Date.now();
    if (raw) {
      const [id, last] = raw.split('|');
      if (id && now - Number(last) < SESSION_MS) {
        sessionStorage.setItem(SID_KEY, `${id}|${now}`);
        return id;
      }
    }
    const id = randomId();
    sessionStorage.setItem(SID_KEY, `${id}|${now}`);
    return id;
  } catch {
    return randomId();
  }
}

/** Origem da visita (utm_source/utm_campaign) guardada na primeira página da sessão */
function utm(): { utmSource?: string; utmCampaign?: string } {
  try {
    const saved = sessionStorage.getItem(UTM_KEY);
    if (saved) return JSON.parse(saved);
    const q = new URLSearchParams(window.location.search);
    const value = {
      utmSource: q.get('utm_source') ?? q.get('ref') ?? undefined,
      utmCampaign: q.get('utm_campaign') ?? undefined,
    };
    sessionStorage.setItem(UTM_KEY, JSON.stringify(value));
    return value;
  } catch {
    return {};
  }
}

function payload(events: QueuedEvent[]): string {
  return JSON.stringify({
    visitorId: visitorId(),
    sessionId: sessionId(),
    referrer: document.referrer || undefined,
    ...utm(),
    events,
  });
}

export function flush(useBeacon = false): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!queue.length) return;
  const batch = queue.splice(0, 25);
  const body = payload(batch);
  try {
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      void fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(
        () => undefined
      );
    }
  } catch {
    /* métricas nunca quebram o app */
  }
  if (queue.length) schedule();
}

function schedule() {
  if (!timer) timer = setTimeout(() => flush(), FLUSH_MS);
}

function listen() {
  if (listening) return;
  listening = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true);
  });
  window.addEventListener('pagehide', () => flush(true));
}

/** Registra um evento. Ex.: track('paywall', { feature: 'tuner' }) */
export function track(name: string, props: Props = {}): void {
  if (analyticsDisabled()) return;
  listen();
  const clean: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) if (v !== undefined) clean[k] = v;
  queue.push({ name, props: clean, path: window.location.pathname, ts: Date.now() });
  if (queue.length >= 20) flush();
  else schedule();
}

/** Rótulo de um botão/link para a contagem de cliques (sem selo PRO, ícones e espaços extras) */
export function clickLabel(el: Element): string | null {
  const explicit = el.getAttribute('data-track');
  if (explicit) return explicit.slice(0, 60);
  const raw = el.getAttribute('aria-label') || (el as HTMLElement).innerText || el.textContent || '';
  const label = raw
    .replace(/★?\s*PRO\b/g, '')
    .replace(/[^\p{L}\p{N}#/()+\-–—.,:% ]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 48);
  return label.length >= 2 ? label : null;
}
