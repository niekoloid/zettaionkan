import { GoogleAuth } from 'google-auth-library'
import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const projectId = query.projectId as string

  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing projectId'
    })
  }

  try {
    const auth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloud-billing.readonly'
      ]
    })

    const client = await auth.getClient()
    const accessTokenResponse = await client.getAccessToken()
    const accessToken = accessTokenResponse.token

    // 1. Get Billing Info
    const billingResponse = await fetch(`https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    if (!billingResponse.ok) {
      const err = await billingResponse.json()
      throw new Error(err.error?.message || 'Failed to fetch billing info')
    }
    
    const billingData = await billingResponse.json()
    let budgetData = null

    // 2. Try to get Budget Info (requires more permissions, might fail)
    if (billingData.billingAccountName) {
      try {
        const budgetResponse = await fetch(`https://billingbudgets.googleapis.com/v1/${billingData.billingAccountName}/budgets`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        if (budgetResponse.ok) {
          budgetData = await budgetResponse.json()
        }
      } catch (e) {
        console.warn('Budget fetch failed - likely insufficient permissions for this service account')
      }
    }

    return {
      billing: billingData,
      budgets: budgetData
    }

  } catch (error: any) {
    console.error('Billing Info Request failed:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})
