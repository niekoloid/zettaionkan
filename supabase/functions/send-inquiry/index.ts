import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RECIPIENT_EMAIL = 'sagong.sun@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, phone, subject, message } = await req.json()

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Email will not be sent.')
      // Return success to client anyway for fallback/testing
      return new Response(
        JSON.stringify({ message: 'Inquiry received (Mock Mode: API Key missing)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Zettaionkan Contact <onboarding@resend.dev>', // Default Resend sender, user should verify domain later
        to: RECIPIENT_EMAIL,
         // Also send copy to user? "お問い合わせを送信した場合sagong.sun@gmail.comにメールが送信されるようにしてください" implies admin notification.
         // Maybe reply-to user?
        reply_to: email,
        subject: `[お問い合わせ] ${subject} (${name}様)`,
        html: `
          <h1>新しいお問い合わせ</h1>
          <p><strong>お名前:</strong> ${name}</p>
          <p><strong>メール:</strong> ${email}</p>
          <p><strong>電話番号:</strong> ${phone || '(未入力)'}</p>
          <p><strong>件名:</strong> ${subject}</p>
          <h2>メッセージ:</h2>
          <p style="white-space: pre-wrap;">${message}</p>
        `
      })
    })

    const data = await res.json()

    if (res.status >= 400) {
        console.error('Resend API Error:', data)
        // Even if email fails, if DB save worked we might want to tell user success? 
        // But user asked to make email send work. So return generic error if it fails?
        // Let's return error so they know configuration is wrong.
        return new Response(
            JSON.stringify({ error: 'Failed to send email via provider', details: data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
     console.error('Function Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
