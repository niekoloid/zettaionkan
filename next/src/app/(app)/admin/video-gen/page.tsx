'use client'
import Link from 'next/link'
import { vcls, vfor } from '@/lib/vue-compat'
import { useEffect, useState } from 'react'

export default function AdminVideoGenPage() {
  const [projectId, setProjectId] = useState(process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID || 'zettaionkan')
  const [accessToken, setAccessToken] = useState(process.env.NEXT_PUBLIC_GOOGLE_CLOUD_ACCESS_TOKEN || '')
  const [modelId, setModelId] = useState('veo-2.0-generate-exp')
  const [prompt, setPrompt] = useState('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [billingInfo, setBillingInfo] = useState<any>(null)
  const [budgetInfo, setBudgetInfo] = useState<any>(null)

  // Restore the token saved on this device
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLOUD_ACCESS_TOKEN) setAccessToken(localStorage.getItem('vai_access_token') || '')
  }, [])

  const isValid = !!(projectId && accessToken && (prompt || imageBase64))

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setImageBase64(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
  const clearImage = () => setImageBase64(null)

  // Save credentials to local storage for convenience
  const saveCredentials = () => localStorage.setItem('vai_access_token', accessToken)

  const callApi = async (url: string, init?: RequestInit) => {
    const res = await fetch(url, init)
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.statusMessage || 'Request failed')
    return body
  }

  const checkBilling = async () => {
    if (!projectId) return
    setError(null)
    setBillingInfo(null)
    setBudgetInfo(null)
    try {
      const data = await callApi(`/api/admin/billing-info?projectId=${encodeURIComponent(projectId)}`)
      setBillingInfo(data.billing)
      setBudgetInfo(data.budgets)
    } catch (e: any) {
      console.error(e)
      setError(`Billing Check Failed: ${e.message}`)
    }
  }

  const generateVideo = async () => {
    saveCredentials()
    setIsLoading(true)
    setError(null)
    setGeneratedVideoUrl(null)
    setStatusMessage('Initializing request...')
    try {
      const instance: Record<string, any> = {}
      if (prompt) instance.prompt = prompt
      if (imageBase64) instance.image = { bytesBase64Encoded: imageBase64.split(',')[1] }

      const data = await callApi('/api/admin/video-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, modelId, instances: [instance], parameters: { sampleCount: 1 } })
      })

      if (data.predictions && data.predictions.length > 0) {
        const pred = data.predictions[0]
        if (pred.bytesBase64Encoded) {
          setGeneratedVideoUrl(`data:video/mp4;base64,${pred.bytesBase64Encoded}`)
        } else if (pred.videoUri) {
          setStatusMessage(`Generated! Video URI: ${pred.videoUri}`)
          throw new Error(`Video generated at ${pred.videoUri}, but cannot be displayed directly due to CORS/Auth. Check GCS bucket.`)
        } else {
          console.log('Prediction result:', pred)
          throw new Error('Unexpected response format')
        }
      } else {
        throw new Error('No predictions returned')
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
<div className="min-h-screen bg-gray-50 p-8 font-mono text-sm"><div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6"><div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-gray-900">🎥 Vertex AI Video Generator (Dev Only)</h1><Link className="text-blue-500 hover:underline" href="/">Back to App</Link></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8">{/* Configuration */}<div className="space-y-6"><section className="space-y-3 p-4 bg-gray-100 rounded-lg"><h2 className="font-bold text-gray-700">🔐 Credentials</h2><div><label className="block text-xs font-bold text-gray-500 mb-1">Google Cloud Project ID</label><div className="w-full px-3 py-2 rounded border border-gray-200 bg-gray-50 text-gray-700 font-bold">zettaionkan</div></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Access Token (Running `gcloud auth print-access-token`)</label><input className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} type="password" placeholder="ya29.a0..." /></div>{/* Billing Check */}<div className="pt-2 border-t border-gray-200"><div className="flex items-center justify-between mb-2"><button className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition" onClick={checkBilling} disabled={!projectId || !accessToken}>Check Billing Info</button>{(billingInfo) ? (<span className={vcls("text-xs font-bold", billingInfo.billingEnabled ? 'text-green-600' : 'text-red-600')}>{billingInfo.billingEnabled ? '✅ Billing Enabled' : '❌ Billing Disabled'}</span>) : null}</div>{(billingInfo && billingInfo.billingEnabled) ? (<div className="space-y-2 p-3 bg-blue-50 rounded border border-blue-100"><div className="flex justify-between items-center text-[10px] font-bold text-blue-900 border-b border-blue-200 pb-1"><span>Billing Account Summary</span><span className="text-green-600">Active</span></div><p className="text-[9px] text-gray-600 font-mono truncate">ID: {billingInfo.billingAccountName}</p>{/* Budget info if available */}{(budgetInfo && budgetInfo.budgets && budgetInfo.budgets.length > 0) ? (<div className="space-y-1"><p className="text-[9px] font-bold text-gray-700">Configured Budgets:</p>{vfor((budgetInfo.budgets as any[]), (b: any, _i: number) => (<div key={b.name} className="text-[9px] bg-white p-1 rounded border shadow-sm flex justify-between"><span className="truncate mr-1">{b.displayName}</span><span className="font-bold shrink-0">{b.amount?.specifiedAmount?.units || 0} {b.amount?.specifiedAmount?.currencyCode}</span></div>))}</div>) : null}<div className="pt-1"><a className="text-[10px] text-blue-600 hover:text-blue-800 font-bold block bg-blue-100 p-2 rounded text-center transition hover:bg-blue-200" href={`https://console.cloud.google.com/billing/${billingInfo.billingAccountName.split('/')[1]}/reports;p=${projectId}`} target="_blank">📊 今月の利用額・クレジット消化を確認</a></div></div>) : null}</div></section><section className="space-y-3"><h2 className="font-bold text-gray-700">⚙️ Generation Settings</h2><div><label className="block text-xs font-bold text-gray-500 mb-1">Model ID</label><select className="w-full px-3 py-2 rounded border border-gray-300" value={modelId} onChange={(e) => setModelId(e.target.value)}><option value="veo-2.0-generate-exp">veo-2.0-generate-exp</option><option value="veo-3.0-generate-001">veo-3.0-generate-001</option></select></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Prompt</label><textarea className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="Describe the video you want to generate..." /></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Input Image (Optional)</label><input className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" type="file" accept="image/*" onChange={handleImageUpload} />{(imageBase64) ? (<div className="mt-2 relative group w-32 h-32 rounded-lg overflow-hidden border"><img className="w-full h-full object-cover" src={imageBase64} /><button className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition" onClick={clearImage}>✕</button></div>) : null}</div></section><button className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2" onClick={generateVideo} disabled={!isValid || isLoading}>{(isLoading) ? (<span className="animate-spin">↻</span>) : null}<span>{isLoading ? 'Generating...' : 'Generate Video'}</span></button>{(error) ? (<div className="text-red-500 text-xs mt-2 bg-red-50 p-2 rounded">{error}</div>) : null}</div>{/* Preview / Results */}<div className="bg-black rounded-xl p-4 flex flex-col items-center justify-center min-h-[400px]">{(generatedVideoUrl) ? (<div className="w-full"><video className="w-full rounded-lg shadow-2xl" src={generatedVideoUrl} controls autoPlay loop /><a className="block text-center mt-4 text-white/50 text-xs hover:text-white" href={generatedVideoUrl} download="generated_video.mp4">Download Video</a></div>) : (isLoading) ? (<div className="text-center text-white/50"><p className="mb-2">Processing...</p><div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 animate-pulse w-full" /></div><p className="text-[10px] mt-4 font-mono">{statusMessage}</p></div>) : (<div className="text-white/30 text-center"><span className="text-4xl block mb-2">🎬</span><p>Generated video will appear here</p></div>)}</div></div></div></div>
  )
}
