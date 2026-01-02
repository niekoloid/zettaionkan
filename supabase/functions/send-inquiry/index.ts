import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !message) {
      throw new Error('Missing required fields')
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'いろおと <onboarding@resend.dev>',
          to: 'sagong.sun@gmail.com',
          subject: `【お問い合わせ】${subject} - ${name}様`,
          html: `
            <h3>新しいお問い合わせが届きました</h3>
            <p><strong>お名前:</strong> ${name}</p>
            <p><strong>メールアドレス:</strong> ${email}</p>
            <p><strong>種別:</strong> ${subject}</p>
            <p><strong>内容:</strong></p>
            <div style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 8px;">${message}</div>
          `,
          reply_to: email,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Email sending failed')
      }
    } else {
      console.log('RESEND_API_KEY not found. Inquiry details:', { name, email, subject, message })
    }

    return new Response(
      JSON.stringify({ message: 'Success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
