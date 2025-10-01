import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get the user ID from metadata
        const userId = session.metadata?.userId;
        
        if (userId && session.customer) {
          // Upgrade user to pro
          await db.update(users)
            .set({
              subscriptionTier: 'pro',
              subscriptionStatus: 'active',
              stripeCustomerId: session.customer as string,
            })
            .where(eq(users.id, userId));
          
          console.log(`User ${userId} upgraded to Pro`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Downgrade user when subscription cancelled
        await db.update(users)
          .set({
            subscriptionTier: 'free',
            subscriptionStatus: 'cancelled',
          })
          .where(eq(users.stripeCustomerId, subscription.customer as string));
        
        console.log(`Subscription cancelled for customer ${subscription.customer}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
        const status = subscription.status === 'active' ? 'active' : 'inactive';
        await db.update(users)
          .set({
            subscriptionStatus: status,
          })
          .where(eq(users.stripeCustomerId, subscription.customer as string));
        
        console.log(`Subscription updated for customer ${subscription.customer}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}