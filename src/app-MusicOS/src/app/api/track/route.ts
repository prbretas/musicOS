/**
 * POST /api/track — recebe eventos de uso (em lote) e grava em analytics_events.
 *
 * Público (o modo grátis também conta), mas:
 *  - só nomes de evento conhecidos e propriedades curtas (lib/analytics/server)
 *  - corpo de no máximo 16 KB, 25 eventos por envio, 120 eventos/min por visitante
 *  - robôs são ignorados
 *  - região vem do cabeçalho da hospedagem; o IP não é guardado
 * Sempre responde 204, para não dar pistas a quem tenta abusar.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { createRateLimiter, deviceFromUA, geoFromHeaders, isBot, parseTrackBody } from '@/lib/analytics/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY = 16_384;
const allow = createRateLimiter(120, 60_000);
const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get('user-agent');
    if (isBot(ua)) return noContent();

    const text = await request.text();
    if (!text || text.length > MAX_BODY) return noContent();

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return noContent();
    }

    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    const parsed = parseTrackBody(body, host);
    if (!parsed) return noContent();
    if (!allow(parsed.ctx.visitorId, parsed.events.length)) return noContent();

    // usuário logado (se houver), para ligar visitas a cadastros
    let userId: string | null = null;
    if (request.cookies.getAll().some((c) => c.name.startsWith('sb-'))) {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }

    const geo = geoFromHeaders(request.headers);
    const device = deviceFromUA(ua);
    const now = Date.now();

    const rows = parsed.events.map((e) => ({
      // horário do navegador só se for plausível (até 10 min atrás); senão, agora
      created_at: new Date(e.ts && e.ts <= now && now - e.ts < 600_000 ? e.ts : now).toISOString(),
      visitor_id: parsed.ctx.visitorId,
      session_id: parsed.ctx.sessionId,
      user_id: userId,
      name: e.name,
      props: e.props,
      path: e.path,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      device,
      referrer: parsed.ctx.referrer,
      utm_source: parsed.ctx.utmSource,
      utm_campaign: parsed.ctx.utmCampaign,
    }));

    const { error } = await createAdminClient().from('analytics_events').insert(rows);
    if (error) console.error('[track]', error.message);
  } catch (err) {
    console.error('[track]', err);
  }
  return noContent();
}
