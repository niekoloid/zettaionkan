import { GoogleAuth } from 'google-auth-library'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const fail = (statusCode: number, statusMessage: string) =>
  NextResponse.json({ statusCode, statusMessage }, { status: statusCode, statusText: undefined })

export async function GET(request: Request) {
  const projectId = new URL(request.url).searchParams.get('projectId')
  if (!projectId) return fail(400, 'Missing projectId')

  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/cloud-billing.readonly']
    })
    const client = await auth.getClient()
    const accessToken = (await client.getAccessToken()).token

    // 1. Billing info
    const billingResponse = await fetch(`https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!billingResponse.ok) {
      const err = await billingResponse.json()
      throw new Error(err.error?.message || 'Failed to fetch billing info')
    }
    const billingData = await billingResponse.json()
    let budgetData = null

    // 2. Budget info (needs more permissions, may fail)
    if (billingData.billingAccountName) {
      try {
        const budgetResponse = await fetch(`https://billingbudgets.googleapis.com/v1/${billingData.billingAccountName}/budgets`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (budgetResponse.ok) budgetData = await budgetResponse.json()
      } catch {
        console.warn('Budget fetch failed - likely insufficient permissions for this service account')
      }
    }

    return NextResponse.json({ billing: billingData, budgets: budgetData })
  } catch (error: any) {
    console.error('Billing Info Request failed:', error)
    return fail(error.statusCode || 500, error.message || 'Internal Server Error')
  }
}
