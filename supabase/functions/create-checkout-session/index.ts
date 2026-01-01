import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    // 管理用クライアント（認証チェックとDB操作用）
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // 認証ヘッダーからトークンを抽出
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    let userId: string | null = null
    let userEmail: string | null = null

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await adminClient.auth.getUser(token)
      if (!authError && user) {
        userId = user.id
        userEmail = user.email || null
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: '認証に失敗しました。再度ログインしてお試しください。' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { tier, return_url } = await req.json();

    // 注: Stripe 管理画面で作成した「価格ID (price_...)」を指定してください
    const PRICE_IDS: Record<string, string> = {
      entry: 'price_1SklvgLUYp7Iz1vvIksrkvfv', // あなたのご自身のアカウントのIDに書き換えてください
      standard: 'price_1SklvDLUYp7Iz1vv2tnKHXWr',
    };

    const price_id = PRICE_IDS[tier];
    if (!price_id) throw new Error('Invalid tier selected');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode: 'subscription',
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: return_url || `${req.headers.get('origin')}/premium/success`,
      cancel_url: `${req.headers.get('origin')}/premium`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          user_id: userId,
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
