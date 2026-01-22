export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const RESEND_API_KEY = config.resendApiKey
  const RECIPIENT_EMAIL = 'sagong.sun@gmail.com'

  try {
    const { name, email, phone, subject, message } = await readBody(event)

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Email will not be sent.')
      return { message: 'Inquiry received (Mock Mode: API Key missing)' }
    }

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

    const data = await res.json()

    if (res.status >= 400) {
      console.error('Resend API Error:', data)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send email via provider',
        data: data
      })
    }

    return data

  } catch (error: any) {
    console.error('API Error:', error)
    throw createError({
      statusCode: error.statusCode || 400,
      statusMessage: error.message || 'Bad Request',
      data: error.data || error
    })
  }
})
