/**
 * PayFast ITN (Instant Transaction Notification) Webhook
 * This handles payment confirmations from PayFast
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      pf_payment_id,
      pf_payfast_id,
      payment_status,
      item_name,
      amount,
      custom_str1, // user email
      custom_str2, // booking reference
      signature
    } = req.body;

    // Verify signature (important for security)
    // See PayFast documentation for signature verification

    if (payment_status === 'COMPLETE') {
      // Update booking status to Paid
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'Paid',
          payment_intent_id: pf_payment_id
        })
        .eq('booking_ref', custom_str2);

      if (error) {
        console.error('Booking update error:', error);
        return res.status(500).json({ error: 'Failed to update booking' });
      }

      // Spots are automatically decremented by the database trigger
      // (see database-schema.sql)
    }

    // Respond to PayFast to stop retries
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Configure this endpoint in PayFast merchant dashboard as:
// https://your-domain.vercel.app/api/payfast-webhook