import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verify Razorpay signature using Web Crypto API
async function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): Promise<boolean> {
  const message = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return generatedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RAZORPAY_KEY_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, plan } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing payment details');
    }

    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id, userId: user.id });

    // Verify signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      console.error('Invalid signature');
      throw new Error('Payment verification failed');
    }

    console.log('Signature verified successfully');

    // Calculate expiry (1 month from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Upsert subscription
    const { data: subscription, error: dbError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan: plan || 'business_pro',
        status: 'active',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: amount || 999,
        currency: 'INR',
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to update subscription');
    }

    console.log('Subscription updated:', subscription?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription: {
          id: subscription?.id,
          plan: subscription?.plan,
          status: subscription?.status,
          expires_at: subscription?.expires_at,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Payment verification error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
