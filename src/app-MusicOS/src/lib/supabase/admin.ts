/**
 * Cliente administrativo do Supabase (service role).
 *
 * Ignora RLS. Usar SOMENTE no servidor, em rotas que não dependem da sessão
 * do usuário: o webhook do Stripe e a criação do cliente no checkout.
 * Nunca importar em componentes cliente.
 */

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada. Veja .env.local.example.');
  }
  if (!adminClient) {
    adminClient = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}
