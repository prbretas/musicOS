# 🎵 MusicOS — Estúdio de teoria musical para quem toca

> Escalas, campo harmônico, braço da guitarra e do ukulele, CAGED, ciclo de quintas, metrônomo, afinador e treino auditivo — num só lugar. **Grátis para começar, Pro para ir além.**

## Modelo de negócio

| Plano | Preço | O que libera |
| --- | --- | --- |
| **Grátis** (sem cadastro) | R$ 0 | Escalas maior/menor/pentatônicas/blues, intervalos, acordes em tríades, braço do violão na afinação padrão, teclado, ciclo de quintas, metrônomo completo |
| **Pro Mensal** | R$ 9,90/mês | Todas as escalas e modos, tétrades e extensões (7, 6, 9, add9, 6/9, sus), CAGED, 13 instrumentos (baixo, viola caipira, cavaquinho, banjo...), afinações alternativas e personalizadas, afinador, treino auditivo com ranking, exportar |
| **Pro Anual** | R$ 89/ano | Tudo do Pro, 25% mais barato |
| **Vitalício** | R$ 197 único | Tudo do Pro, para sempre, com atualizações futuras |

Fluxo: o estúdio abre sem login → recursos Pro aparecem com o selo **PRO** → ao clicar, abre o modal de upgrade → o usuário cria a conta (e-mail ou Google) → paga no Stripe → o webhook libera o acesso na hora.

Preços e textos ficam em um só lugar: `src/app-MusicOS/src/lib/plans.ts`. Quais recursos são Pro: `src/lib/features.ts`.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **Supabase** — autenticação (e-mail/senha e Google) e banco (`profiles`)
- **Stripe** — assinaturas (mensal/anual) e pagamento único (vitalício), com webhook e portal do cliente
- **Web Audio API** — síntese, metrônomo e afinador (sem dependências)
- Vitest (unitários) + Playwright (E2E)

## Rodando localmente

Pré-requisitos: Node 18+ e contas no [Supabase](https://supabase.com) e [Stripe](https://stripe.com).

```bash
cd src/app-MusicOS
cp .env.local.example .env.local   # preencha as chaves
npm install
npm run dev                        # http://localhost:3000
```

No Windows, `INICIAR-MUSICOS.bat` faz o mesmo.

### 1. Supabase

1. Crie um projeto e copie **URL**, **anon key** e **service_role key** para o `.env.local`.
2. SQL Editor → rode, nesta ordem, `docs/supabase-migration-v2.sql` (perfis, cobrança, policies), `docs/supabase-migration-v3-ranking.sql` (ranking dos exercícios) e `docs/supabase-migration-v4-devices.sql` (limite de 1 computador + 1 celular por conta).
3. Authentication → URL Configuration: **Site URL** = sua URL pública; **Redirect URLs** = `https://SEU-DOMINIO/auth/callback` (e `http://localhost:3000/auth/callback` em dev).
4. Para login com Google: Authentication → Providers → Google (crie as credenciais OAuth no Google Cloud com o redirect `https://SEU-PROJETO.supabase.co/auth/v1/callback`).

### 2. Stripe

1. Products → crie o produto **MusicOS Pro** com dois preços recorrentes (mensal R$ 9,90 e anual R$ 89) e o produto **MusicOS Vitalício** com um preço único (R$ 197). Cole os três `price_...` no `.env.local`.
2. Developers → Webhooks → endpoint `https://SEU-DOMINIO/api/webhooks/stripe` com os eventos:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`. Copie o **signing secret** para `STRIPE_WEBHOOK_SECRET`.
3. Settings → Billing → Customer portal: ative e permita cancelamento e troca de forma de pagamento.
4. Em desenvolvimento: `stripe listen --forward-to localhost:3000/api/webhooks/stripe --all-snapshot`.
5. Reconciliação diária: defina `CRON_SECRET` e agende `GET /api/cron/reconcile` com `Authorization: Bearer <CRON_SECRET>`. Ela corrige o banco se algum webhook se perder e mantém o e-mail do cliente atualizado no Stripe.

## Rodando em container (Podman ou Docker)

Com o `.env.local` preenchido (passos acima):

```bash
podman compose --env-file src/app-MusicOS/.env.local up -d --build   # sobe em http://localhost:3000
podman compose logs -f        # acompanha os logs
podman compose stop           # pausa (podman compose start retoma)
podman compose down           # para e remove o container
```

Com Docker, troque `podman` por `docker`. A imagem é multi-stage (`src/app-MusicOS/Dockerfile`), roda como usuário sem privilégios e tem healthcheck. Para mudar a porta: `PORT=8080 podman compose ...`.

Num servidor de verdade: coloque um proxy com HTTPS na frente (Caddy ou Nginx), ajuste `NEXT_PUBLIC_APP_URL` para o domínio e cadastre `https://SEU-DOMINIO/auth/callback` no Supabase e `https://SEU-DOMINIO/api/webhooks/stripe` no Stripe. Como as variáveis `NEXT_PUBLIC_*` entram no build, mudar o domínio exige `up -d --build` de novo.

## Testes

```bash
npm test               # unitários (Vitest)
npm run test:e2e       # E2E (Playwright) — precisa do app rodando ou do build
npm run lint && npx tsc --noEmit
```

## Estrutura

```
src/app-MusicOS/src
├── app/
│   ├── page.tsx                 # Estúdio (o app; modo grátis sem login)
│   ├── pricing/                 # Planos
│   ├── (auth)/login|signup|forgot-password
│   ├── auth/callback|reset-password
│   ├── checkout/                # ponte cadastro → Stripe
│   ├── account/                 # Minha conta (plano, portal, perfil)
│   ├── (legal)/terms|privacy
│   └── api/stripe/{checkout,portal}, api/webhooks/stripe
├── components/
│   ├── estudio/                 # seções do estúdio (braço, acordes, afinador, exercícios…)
│   ├── pro/                     # ProBadge, ProGate, UpgradeProvider (modal de upgrade)
│   ├── providers/AuthProvider   # sessão + perfil + entitlement
│   └── layout/, auth/, ui/
├── lib/
│   ├── plans.ts                 # preços e textos dos planos
│   ├── features.ts              # o que é grátis e o que é Pro
│   ├── entitlements.ts          # regra de acesso a partir do perfil
│   ├── stripe/, supabase/       # servidor, cliente e admin
│   └── music/                   # engine de teoria musical
└── middleware.ts                # sessão + rotas protegidas
```

## Documentação

- `docs/supabase-migration-v2.sql` — schema atual
- `docs/` — produto, roadmap, arquitetura e manual do usuário

## Licença

**Software proprietário — todos os direitos reservados.** Este código não é open source e não é distribuído a clientes.
Os planos (inclusive o Vitalício) dão direito de **acesso ao serviço** pela plataforma, com login; nenhum plano inclui código-fonte,
download ou instalação do software. O acesso vitalício é controlado pelo Stripe + Supabase (`subscription_tier = 'lifetime'`).
