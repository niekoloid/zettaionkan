import { GoogleAuth } from 'google-auth-library'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const fail = (statusCode: number, statusMessage: string) => NextResponse.json({ statusCode, statusMessage }, { status: statusCode })

export async function POST(request: Request) {
  const { projectId, modelId, instances, parameters } = await request.json().catch(() => ({}))
  if (!projectId || !modelId || !instances) return fail(400, 'Missing required parameters')

  try {
    // 1. Auth
    const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' })
    const client = await auth.getClient()
    const finalProjectId = projectId || (await auth.getProjectId())

    // 2. Access token
    const accessToken = (await client.getAccessToken()).token
    if (!accessToken) throw new Error('Failed to obtain access token')

    // 3. Vertex AI endpoint
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${finalProjectId}/locations/us-central1/publishers/google/models/${modelId}:predict`

    // 4. Call Vertex AI
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances, parameters })
    })
    if (!response.ok) {
      const errorData = await response.json()
      return fail(response.status, errorData.error?.message || 'Vertex AI API request failed')
    }
    return NextResponse.json(await response.json())
  } catch (error: any) {
    console.error('Video Gen Server Error:', error)
    return fail(error.statusCode || 500, error.message || 'Internal Server Error')
  }
}
