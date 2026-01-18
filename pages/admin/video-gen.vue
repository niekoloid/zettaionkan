<template>
  <div class="min-h-screen bg-gray-50 p-8 font-mono text-sm">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">🎥 Vertex AI Video Generator (Dev Only)</h1>
        <NuxtLink to="/" class="text-blue-500 hover:underline">Back to App</NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Configuration -->
        <div class="space-y-6">
          
          <section class="space-y-3 p-4 bg-gray-100 rounded-lg">
            <h2 class="font-bold text-gray-700">🔐 Credentials</h2>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Google Cloud Project ID</label>
              <div class="w-full px-3 py-2 rounded border border-gray-200 bg-gray-50 text-gray-700 font-bold">
                zettaionkan
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Access Token (Running `gcloud auth print-access-token`)</label>
              <input 
                v-model="accessToken" 
                type="password" 
                placeholder="ya29.a0..."
                class="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <!-- Billing Check -->
            <div class="pt-2 border-t border-gray-200">
                <div class="flex items-center justify-between mb-2">
                    <button 
                        @click="checkBilling" 
                        class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition" 
                        :disabled="!projectId || !accessToken"
                    >
                        Check Billing Info
                    </button>
                    
                    <span v-if="billingInfo" class="text-xs font-bold" :class="billingInfo.billingEnabled ? 'text-green-600' : 'text-red-600'">
                        {{ billingInfo.billingEnabled ? '✅ Billing Enabled' : '❌ Billing Disabled' }}
                    </span>
                 </div>

                 <div v-if="billingInfo && billingInfo.billingEnabled" class="space-y-2 p-3 bg-blue-50 rounded border border-blue-100">
                    <div class="flex justify-between items-center text-[10px] font-bold text-blue-900 border-b border-blue-200 pb-1">
                        <span>Billing Account Summary</span>
                        <span class="text-green-600">Active</span>
                    </div>
                    
                    <p class="text-[9px] text-gray-600 font-mono truncate">ID: {{ billingInfo.billingAccountName }}</p>
                    
                    <!-- Budget info if available -->
                    <div v-if="budgetInfo && budgetInfo.budgets && budgetInfo.budgets.length > 0" class="space-y-1">
                        <p class="text-[9px] font-bold text-gray-700">Configured Budgets:</p>
                        <div v-for="b in budgetInfo.budgets" :key="b.name" class="text-[9px] bg-white p-1 rounded border shadow-sm flex justify-between">
                            <span class="truncate mr-1">{{ b.displayName }}</span>
                            <span class="font-bold shrink-0">{{ b.amount?.specifiedAmount?.units || 0 }} {{ b.amount?.specifiedAmount?.currencyCode }}</span>
                        </div>
                    </div>

                    <div class="pt-1">
                        <a 
                          :href="`https://console.cloud.google.com/billing/${billingInfo.billingAccountName.split('/')[1]}/reports;p=${projectId}`" 
                          target="_blank"
                          class="text-[10px] text-blue-600 hover:text-blue-800 font-bold block bg-blue-100 p-2 rounded text-center transition hover:bg-blue-200"
                        >
                          📊 今月の利用額・クレジット消化を確認
                        </a>
                    </div>
                 </div>
            </div>
          </section>

          <section class="space-y-3">
            <h2 class="font-bold text-gray-700">⚙️ Generation Settings</h2>
            
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Model ID</label>
              <select v-model="modelId" class="w-full px-3 py-2 rounded border border-gray-300">
                <option value="veo-2.0-generate-exp">veo-2.0-generate-exp</option>
                <option value="veo-3.0-generate-001">veo-3.0-generate-001</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Prompt</label>
              <textarea 
                v-model="prompt" 
                rows="3"
                class="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the video you want to generate..."
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Input Image (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                @change="handleImageUpload"
                class="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              >
              <div v-if="imageBase64" class="mt-2 relative group w-32 h-32 rounded-lg overflow-hidden border">
                <img :src="imageBase64" class="w-full h-full object-cover">
                <button @click="clearImage" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">✕</button>
              </div>
            </div>
          </section>

          <button 
            @click="generateVideo"
            :disabled="!isValid || isLoading"
            class="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span v-if="isLoading" class="animate-spin">↻</span>
            <span>{{ isLoading ? 'Generating...' : 'Generate Video' }}</span>
          </button>
          
          <div v-if="error" class="text-red-500 text-xs mt-2 bg-red-50 p-2 rounded">
            {{ error }}
          </div>

        </div>

        <!-- Preview / Results -->
        <div class="bg-black rounded-xl p-4 flex flex-col items-center justify-center min-h-[400px]">
          <div v-if="generatedVideoUrl" class="w-full">
            <video 
              :src="generatedVideoUrl" 
              controls 
              autoplay 
              loop
              class="w-full rounded-lg shadow-2xl"
            ></video>
            <a 
              :href="generatedVideoUrl" 
              download="generated_video.mp4" 
              class="block text-center mt-4 text-white/50 text-xs hover:text-white"
            >Download Video</a>
          </div>
          <div v-else-if="isLoading" class="text-center text-white/50">
            <p class="mb-2">Processing...</p>
            <div class="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
               <div class="h-full bg-blue-500 animate-pulse w-full"></div>
            </div>
            <p class="text-[10px] mt-4 font-mono">{{ statusMessage }}</p>
          </div>
          <div v-else class="text-white/30 text-center">
            <span class="text-4xl block mb-2">🎬</span>
            <p>Generated video will appear here</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const projectId = ref(import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || 'zettaionkan')
const accessToken = ref(import.meta.env.VITE_GOOGLE_CLOUD_ACCESS_TOKEN || localStorage.getItem('vai_access_token') || '')
const modelId = ref('veo-2.0-generate-exp')
const prompt = ref('')
const imageBase64 = ref<string | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const generatedVideoUrl = ref<string | null>(null)
const statusMessage = ref('')

const isValid = computed(() => {
  return projectId.value && accessToken.value && (prompt.value || imageBase64.value)
})

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (ev) => {
    imageBase64.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  imageBase64.value = null
}

// Save credentials to local storage for convenience
const saveCredentials = () => {
  localStorage.setItem('vai_access_token', accessToken.value)
}

const billingInfo = ref<any>(null)
const budgetInfo = ref<any>(null)

const checkBilling = async () => {
    if (!projectId.value || !accessToken.value) return
    error.value = null
    billingInfo.value = null
    budgetInfo.value = null
    
    // Check if billing is enabled for the project
    try {
        const response = await fetch(`https://cloudbilling.googleapis.com/v1/projects/${projectId.value}/billingInfo`, {
            headers: {
                'Authorization': `Bearer ${accessToken.value}`
            }
        })
        
        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error?.message || 'Failed to fetch billing info')
        }
        
        const data = await response.json()
        billingInfo.value = data

        // Try to fetch budget info if permissions allow
        if (data.billingAccountName) {
            try {
                const bResponse = await fetch(`https://billingbudgets.googleapis.com/v1/${data.billingAccountName}/budgets`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken.value}`
                    }
                })
                if (bResponse.ok) {
                    budgetInfo.value = await bResponse.json()
                }
            } catch (e) {
                console.warn('Budget info fetch failed - might lack Billing Account level permissions')
            }
        }
        
    } catch (e: any) {
        console.error(e)
        error.value = `Billing Check Failed: ${e.message}`
    }
}

const generateVideo = async () => {
  saveCredentials()
  isLoading.value = true
  error.value = null
  generatedVideoUrl.value = null
  statusMessage.value = 'Initializing request...'

  try {
    // 1. Prepare Request
    // Veo API Endpoint structure:
    // https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/us-central1/publishers/google/models/{MODEL}:predict
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId.value}/locations/us-central1/publishers/google/models/${modelId.value}:predict`
    
    // Construct Payload
    // Based on Veo documentation, input is 'instances' list.
    const instance: Record<string, any> = {}
    if (prompt.value) instance.prompt = prompt.value
    if (imageBase64.value) {
      // Remove data URL prefix for API
      const base64Clean = imageBase64.value.split(',')[1]
      instance.image = { bytesBase64Encoded: base64Clean }
    }

    const payload = {
      instances: [instance],
      parameters: {
        // Default parameters
        sampleCount: 1,
        // videoLength: "5s", // optional
        // aspectRatio: "16:9" // optional
      }
    }

    // 2. Send Prediction Request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Request failed')
    }

    const data = await response.json()
    
    // Veo usually returns bytes directly in 'predictions' OR an LRO if it's slow?
    // Most 'predict' endpoints return immediate results or base64.
    // However, some generation endpoints use 'predict' but take a while.
    // Let's assume standard Vertex AI Prediction response: { predictions: [ { bytesBase64Encoded: "..." } ] }
    // Or it might be a GCS URI.
    
    // NOTE: Veo might differ from Imagen.
    // If it returns a GCS URI (e.g. `videoUri`), we can try to display it (might need signing or authenticated fetch).
    // If it returns base64 content, we can display immediately.
    
    if (data.predictions && data.predictions.length > 0) {
      const pred = data.predictions[0]
      
      if (pred.bytesBase64Encoded) {
        generatedVideoUrl.value = `data:video/mp4;base64,${pred.bytesBase64Encoded}`
      } else if (pred.videoUri) {
         // If it's a GCS URI, we might not be able to view it directly without auth.
         // But let's try.
         statusMessage.value = `Generated! Video URI: ${pred.videoUri}`
         // We can't easily display a gs:// URI or private https://storage.cloud.google.com URI without auth cookies.
         // For now, let's warn if this happens.
         throw new Error(`Video generated at ${pred.videoUri}, but cannot be displayed directly due to CORS/Auth. Check GCS bucket.`)
      } else {
        // Check for other fields?
        console.log('Prediction result:', pred)
        throw new Error('Unexpected response format')
      }
    } else {
       throw new Error('No predictions returned')
    }

  } catch (e: any) {
    console.error(e)
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}
</script>
