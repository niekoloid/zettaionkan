export default defineEventHandler(async (event) => {
  console.log('[API] /api/inquiry requested')
  
  const config = useRuntimeConfig()
  // Fallback to process.env for broader compatibility (e.g. Vercel/Netlify env vars)
  const RESEND_API_KEY = config.resendApiKey || process.env.RESEND_API_KEY
  const RECIPIENT_EMAIL = 'sagong.sun@gmail.com'

  console.log('[API] Check Config:', { 
    hasResendKey: !!RESEND_API_KEY, 
    recipient: RECIPIENT_EMAIL 
  })

  try {
    const body = await readBody(event)
    console.log('[API] Request Body:', JSON.stringify(body, null, 2))
    
    const { name, email, phone, subject, message } = body

    if (!RESEND_API_KEY) {
      console.warn('[API] RESEND_API_KEY is not set. Email will not be sent.')
      return { message: 'Inquiry received (Mock Mode: API Key missing)' }
    }

    console.log('[API] Sending email via Resend...')
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Zettaionkan Contact <onboarding@resend.dev>',
        to: RECIPIENT_EMAIL,
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

    console.log('[API] Resend API Status:', res.status)
    const data = await res.json()
    console.log('[API] Resend API Response:', JSON.stringify(data, null, 2))

    if (res.status >= 400) {
      console.error('[API] Resend API Error:', data)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send email via provider',
        data: data
      })
    }

    return data

  } catch (error: any) {
    console.error('[API] Critical Error:', error)
    throw createError({
      statusCode: error.statusCode || 400,
      statusMessage: error.message || 'Bad Request',
      data: error.data || error
    })
  }
})
