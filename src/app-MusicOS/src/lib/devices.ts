/**
 * Limite de dispositivos: cada conta usa no máximo 1 computador e 1 celular
 * ao mesmo tempo. Entrar num novo dispositivo do mesmo tipo encerra a sessão
 * do anterior (a regra fica no banco: claim_device / check_device).
 *
 * Aqui ficam só as partes do navegador: identificar o tipo do aparelho, um id
 * estável por navegador e um nome legível para a lista da página da conta.
 */

export type DeviceKind = 'desktop' | 'mobile';

export interface DeviceRow {
  kind: DeviceKind;
  device_id: string;
  session_id: string;
  label: string | null;
  last_seen: string;
  created_at: string;
}

export const DEVICE_KIND_LABEL: Record<DeviceKind, string> = {
  desktop: 'Computador',
  mobile: 'Celular ou tablet',
};

const MOBILE_UA = /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle|Opera Mini|IEMobile/i;

/**
 * Celular/tablet ou computador. iPadOS se apresenta como Mac, então um "Mac"
 * com tela de toque conta como tablet.
 */
export function detectDeviceKind(userAgent: string, maxTouchPoints = 0): DeviceKind {
  if (MOBILE_UA.test(userAgent)) return 'mobile';
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return 'mobile';
  return 'desktop';
}

/** "Chrome no Windows", "Safari no iPhone"… */
export function deviceLabel(userAgent: string, maxTouchPoints = 0): string {
  const ua = userAgent;
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /SamsungBrowser/.test(ua)
        ? 'Samsung Internet'
        : /Firefox|FxiOS/.test(ua)
          ? 'Firefox'
          : /Chrome|CriOS/.test(ua)
            ? 'Chrome'
            : /Safari/.test(ua)
              ? 'Safari'
              : 'Navegador';
  const os = /iPhone/.test(ua)
    ? 'iPhone'
    : /iPad/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1)
      ? 'iPad'
      : /Android/.test(ua)
        ? 'Android'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Mac OS X|Macintosh/.test(ua)
            ? 'Mac'
            : /CrOS/.test(ua)
              ? 'Chromebook'
              : /Linux/.test(ua)
                ? 'Linux'
                : 'outro sistema';
  return `${browser} no ${os}`;
}

const DEVICE_ID_KEY = 'musicos:device-id';

/** Id aleatório guardado neste navegador (não identifica a pessoa, só o aparelho). */
export function getDeviceId(): string {
  try {
    const saved = localStorage.getItem(DEVICE_ID_KEY);
    if (saved && saved.length >= 8 && saved.length <= 64) return saved;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return `tmp-${Math.random().toString(36).slice(2, 14)}`;
  }
}

/** Lê o session_id de um access token do Supabase (sem validar: só para comparar). */
export function sessionIdFromToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const json = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    const payload = JSON.parse(json) as { session_id?: unknown };
    return typeof payload.session_id === 'string' ? payload.session_id : null;
  } catch {
    return null;
  }
}

/** Motivo mostrado na tela de login depois que a sessão caiu */
export const KICKED_QUERY = 'motivo=outro-dispositivo';
