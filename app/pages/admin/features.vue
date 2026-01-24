<script setup lang="ts">
import { FEATURE_DESCRIPTIONS, type FeatureKey } from '~/constants/features';

const { featuresList, isEnabled, toggleFeature, resetFeatures, getFeatureConfig } = useFeatures()

// Helper to get all states reactively
const groupedFeatures = computed(() => {
  const groups: Record<string, any[]> = {}
  
  featuresList.forEach(key => {
    let category = 'Other'
    if (key.startsWith('page_')) category = 'Pages'
    else if (key.startsWith('home_chord_')) category = 'Home Chords'
    else if (key.startsWith('autoplay_chord_')) category = 'Autoplay Chords'
    else if (key.startsWith('mode_')) category = 'Autoplay Modes'
    else if (key.startsWith('settings_')) category = 'Settings'
    else if (key.startsWith('quiz_')) category = 'Quiz Features'
    else if (key.startsWith('singlenote_')) category = 'Single Note Test Features'
    else if (key.startsWith('history_')) category = 'History Features'
    else if (key.startsWith('instrument_') || key === 'parent_voice') category = 'Core Features'

    if (!groups[category]) groups[category] = []
    const currentGroup = groups[category]!
    
    currentGroup.push({
      key,
      enabled: isEnabled(key),
      tier: getFeatureConfig(key).tier,
      description: FEATURE_DESCRIPTIONS[key] || key
    })
  })

  // Define sort order
  const order = [
    'Pages', 
    'Core Features', 
    'Quiz Features',
    'Single Note Test Features',
    'History Features',
    'Home Chords', 
    'Autoplay Chords', 
    'Autoplay Modes', 
    'Settings', 
    'Other'
  ]
  
  return order
    .filter(cat => groups[cat]?.length)
    .map(cat => ({
      name: cat,
      features: groups[cat]
    }))
})

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600 border-gray-200',
  entry: 'bg-sky-50 text-sky-700 border-sky-200',
  standard: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  premium: 'bg-purple-50 text-purple-700 border-purple-200',
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased text-gray-900">
    <div class="p-8 max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Feature Flags
          </h1>
          <p class="text-gray-500 mt-2">Manage application feature toggles and overrides.</p>
        </div>
        <div class="flex gap-3">
          <button 
            @click="resetFeatures"
            class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Reset Defaults
          </button>
          <NuxtLink 
            to="/settings" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
          >
            Back to Settings
          </NuxtLink>
        </div>
      </div>

      <div class="space-y-8">
        <section v-for="group in groupedFeatures" :key="group.name">
          <h2 class="text-lg font-bold text-gray-400 mb-4 px-1 uppercase tracking-wider flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {{ group.name }}
          </h2>
          
          <div class="grid gap-3">
            <div 
              v-for="feature in group.features" 
              :key="feature.key"
              class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between transition-all hover:shadow-md hover:border-blue-200 group"
            >
              <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-gray-900">{{ feature.description }}</span>
                  <span 
                    class="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border"
                    :class="tierColors[feature.tier] || tierColors['free']"
                  >
                    {{ feature.tier }}
                  </span>
                </div>
                <code class="text-xs font-mono text-gray-400 group-hover:text-blue-500 transition-colors">{{ feature.key }}</code>
              </div>
              
              <div class="flex items-center gap-4">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    :checked="feature.enabled" 
                    @change="toggleFeature(feature.key)"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span class="ml-3 text-sm font-medium text-gray-500 peer-checked:text-blue-600 transition-colors w-9 text-right inline-block">
                    {{ feature.enabled ? 'On' : 'Off' }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
