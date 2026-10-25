import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

type StripeEvent = Stripe.Event;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: StripeEvent;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const interval = session.metadata?.interval;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const tier = interval === 'lifetime' ? 'lifetime' : 'pro';

          await supabase.from('subscriptions').upsert({
            user_id: userId,
            tier,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          });

          await supabase.from('profiles').upsert({
            id: userId,
            subscription_tier: tier,
            subscription_status: 'active',
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const tier =
            subscription.metadata?.interval === 'lifetime' ||
            subscription.metadata?.lifetime
              ? 'lifetime'
              : 'pro';

          await supabase.from('subscriptions').upsert({
            user_id: profile.id,
            tier,
            status: subscription.status as 'active' | 'canceled' | 'past_due',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          });

          await supabase.from('profiles').upsert({
            id: profile.id,
            subscription_tier: tier,
            subscription_status: subscription.status as 'active' | 'canceled' | 'past_due',
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase.from('subscriptions').upsert({
            user_id: profile.id,
            tier: 'free',
            status: 'canceled',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            current_period_end: null,
          });

          await supabase.from('profiles').upsert({
            id: profile.id,
            subscription_tier: 'free',
            subscription_status: 'canceled',
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase.from('profiles').upsert({
            id: profile.id,
            subscription_status: 'past_due',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}