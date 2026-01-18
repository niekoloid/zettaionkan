import { GoogleAuth } from 'google-auth-library'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { projectId, modelId, instances, parameters } = body

  if (!projectId || !modelId || !instances) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters'
    })
  }

  try {
    // 1. Setup Auth
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    })

    const client = await auth.getClient()
    const projectIdFromAuth = await auth.getProjectId()
    const finalProjectId = projectId || projectIdFromAuth

    // 2. Get Access Token
    const accessTokenResponse = await client.getAccessToken()
    const accessToken = accessTokenResponse.token

    if (!accessToken) {
      throw new Error('Failed to obtain access token')
    }

    // 3. Construct Vertex AI Endpoint
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${finalProjectId}/locations/us-central1/publishers/google/models/${modelId}:predict`

    // 4. Call Vertex AI
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances,
        parameters
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw createError({
        statusCode: response.status,
        statusMessage: errorData.error?.message || 'Vertex AI API request failed'
      })
    }

    const data = await response.json()
    return data

  } catch (error: any) {
    console.error('Video Gen Server Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})
