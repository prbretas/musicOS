'use client';

import { useState } from 'react';
import { SUBSCRIPTION_TIERS, formatPrice, type SubscriptionTier } from '@/lib/subscription';
import { InfoButton } from '@/components/ui/InfoButton';

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'lifetime'>('monthly');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Desbloqueie todo o potencial do MusicOS com recursos profissionais para acelerar seu aprendizado musical
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/10 rounded-2xl p-1 inline-flex">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingInterval('lifetime')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                billingInterval === 'lifetime'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vitalício
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">
              {SUBSCRIPTION_TIERS.free.name}
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">Grátis</span>
            </div>
            <p className="text-slate-400 mb-6">
              Para quem está começando e quer explorar o básico
            </p>

            <ul className="space-y-4 mb-8">
              {SUBSCRIPTION_TIERS.free.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-slate-300">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button className="w-full py-4 px-6 rounded-xl border-2 border-slate-500 text-white font-semibold hover:bg-slate-800 transition-all">
              Começar Grátis
            </button>
          </div>

          {/* Pro */}
          <div className="relative bg-gradient-to-b from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500 transform md:scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-semibold">
              Mais Popular
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {SUBSCRIPTION_TIERS.pro.name}
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                {billingInterval === 'monthly'
                  ? formatPrice(SUBSCRIPTION_TIERS.pro.price, 'mês')
                  : formatPrice(97)}
              </span>
              {billingInterval === 'monthly' && (
                <span className="text-slate-400 ml-2">
                  /mês
                </span>
              )}
            </div>
            <p className="text-slate-400 mb-6">
              Para músicos comprometidos com o progresso
            </p>

            <ul className="space-y-4 mb-8">
              {SUBSCRIPTION_TIERS.pro.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-slate-300">
                  <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25">
              Assinar Agora
            </button>
          </div>

          {/* Lifetime */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">
              {SUBSCRIPTION_TIERS.lifetime.name}
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                {formatPrice(SUBSCRIPTION_TIERS.lifetime.price)}
              </span>
              <span className="text-slate-400 ml-2">
                único
              </span>
            </div>
            <p className="text-slate-400 mb-6">
              Para quem quer acesso vitalício com um único pagamento
            </p>

            <ul className="space-y-4 mb-8">
              {SUBSCRIPTION_TIERS.lifetime.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-slate-300">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button className="w-full py-4 px-6 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25">
              Comprar Vitalício
            </button>
          </div>
        </div>

        {/* Comparison section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Compare os recursos
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-6 text-slate-400 font-medium">Recurso</th>
                  <th className="py-4 px-6 text-center text-white font-medium">Grátis</th>
                  <th className="py-4 px-6 text-center text-white font-medium">Pro</th>
                  <th className="py-4 px-6 text-center text-white font-medium">Lifetime</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Escalas e modos', free: true, pro: true, lifetime: true },
                  { feature: 'Diagramas de acordes', free: 'Básico', pro: 'Completo', lifetime: 'Completo' },
                  { feature: 'Círculo das quintas', free: true, pro: true, lifetime: true },
                  { feature: 'Metrônomo', free: true, pro: true, lifetime: true },
                  { feature: 'Ukulele afinações', free: '1', pro: 'Todas', lifetime: 'Todas' },
                  { feature: 'Guitarra afinações', free: false, pro: true, lifetime: true },
                  { feature: 'Afinações customizadas', free: '1', pro: 'Ilimitadas', lifetime: 'Ilimitadas' },
                  { feature: 'Exportar cifras', free: false, pro: true, lifetime: true },
                  { feature: 'Sem anúncios', free: false, pro: true, lifetime: true },
                  { feature: 'Suporte prioritário', free: false, pro: false, lifetime: true },
                  { feature: 'Atualizações futuras', free: false, pro: false, lifetime: true },
                ].map((row, idx) => (
                  <tr key={row.feature} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 px-6 text-slate-300">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <svg className="w-5 h-5 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )
                      ) : (
                        <span className="text-slate-400">{row.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <svg className="w-5 h-5 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )
                      ) : (
                        <span className="text-purple-400">{row.pro}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.lifetime === 'boolean' ? (
                        row.lifetime ? (
                          <svg className="w-5 h-5 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )
                      ) : (
                        <span className="text-amber-400">{row.lifetime}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim! Você pode cancelar sua assinatura mensal quando quiser. Não há taxas de cancelamento.',
              },
              {
                q: 'O que é o plano Lifetime?',
                a: 'O plano Lifetime é um pagamento único que dá acesso vitalício a todas as funcionalidades Pro, incluindo atualizações futuras.',
              },
              {
                q: 'Como funciona o suporte?',
                a: 'Usuários Pro têm acesso ao suporte por email em até 24h. Usuários Lifetime têm prioridade no suporte.',
              },
              {
                q: 'Posso trocar de plano depois?',
                a: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações entram na próxima ciclo de cobrança.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-slate-400 mb-4">
            Ainda tem dúvidas? Fale com nossa equipe
          </p>
          <a
            href="mailto:suporte@musicos.app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            suporte@musicos.app
          </a>
        </div>
      </div>
    </div>
  );
}