import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay credentials');
      throw new Error('Razorpay credentials not configured');
    }

    const { amount, currency = 'INR', receipt, notes } = await req.json();

    if (!amount) {
      throw new Error('Amount is required');
    }

    console.log('Creating Razorpay order:', { amount, currency, receipt });

    // Create order using Razorpay Orders API
    const authHeader = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {},
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      console.error('Razorpay API error:', errorData);
      throw new Error(`Razorpay API error: ${orderResponse.status}`);
    }

    const order = await orderResponse.json();
    console.log('Order created successfully:', order.id);

    return new Response(
      JSON.stringify({ 
        orderId: order.id, 
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating order:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
