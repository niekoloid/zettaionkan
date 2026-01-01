import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, tier, return_url } = await req.json();

    // 注: 本来はここには Stripe の「価格ID (price_...)」を入れる必要があります。
    // 商品ID (prod_...) ではエラーになる可能性があるため、Stripe管理画面で
    // 各商品の詳細ページにある「価格ID」をコピーして差し替えてください。
    const PRICE_IDS: Record<string, string> = {
      entry: 'price_1SklvgLUYp7Iz1vvIksrkvfv',
      standard: 'price_1SklvDLUYp7Iz1vv2tnKHXWr',
      premium: 'price_1SklVSLUYp7Iz1vvr25KjOLJ',
    };

    const price_id = PRICE_IDS[tier];

    if (!price_id) {
      throw new Error('Invalid tier selected');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      client_reference_id: user_id,
      success_url: return_url || `${req.headers.get('origin')}/premium/success`,
      cancel_url: `${req.headers.get('origin')}/premium`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          user_id: user_id,
          tier: tier
        }
      }
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
