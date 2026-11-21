import Stripe from 'stripe';

let client: Stripe | null = null;

/**
 * Cliente do Stripe para uso no servidor, criado so na primeira chamada.
 * Assim o build e os testes nao precisam da chave; a rota so falha se for chamada sem ela.
 */
export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY nao configurada');
  client = new Stripe(key, { apiVersion: '2023-10-16' });
  return client;
}
