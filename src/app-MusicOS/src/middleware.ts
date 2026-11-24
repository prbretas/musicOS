/**
 * Middleware de sessão.
 *
 * 1. Renova o token do Supabase a cada requisição (padrão @supabase/ssr).
 * 2. Protege as rotas que exigem login (conta, checkout, portal).
 * 3. Quem já está logado não vê /login e /signup — vai para `next` ou para a home.
 *
 * O modo grátis (a home `/`) nunca exige login.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/account', '/checkout', '/api/stripe/checkout', '/api/stripe/portal'];
const AUTH_PAGES = ['/login', '/signup', '/forgot-password'];

function safeNext(value: string | null, fallback = '/'): string {
  // Só aceita caminhos internos, para não virar um redirecionador aberto
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() valida o token no servidor do Supabase (não confiar só no cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isProtected && !user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = safeNext(searchParams.get('next'));
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Tudo, exceto arquivos estáticos e o webhook do Stripe (que não tem
     * sessão de usuário e é validado pela assinatura do Stripe).
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json|icons/|imgs/|api/webhooks/).*)',
  ],
};
