'use client'
import Link from 'next/link'
import { vcls, vfor } from '@/lib/vue-compat'
import { useMemo } from 'react'
import { FEATURE_DESCRIPTIONS } from '@/constants/features'
import { useFeatures } from '@/lib/app-context'

export default function AdminFeaturesPage() {
  const { featuresList, isEnabled, toggleFeature, resetFeatures, getFeatureConfig } = useFeatures()

  const groupedFeatures = useMemo(() => {
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
      groups[category]!.push({ key, enabled: isEnabled(key), tier: getFeatureConfig(key).tier, description: FEATURE_DESCRIPTIONS[key] || key })
    })
    const order = ['Pages', 'Core Features', 'Quiz Features', 'Single Note Test Features', 'History Features', 'Home Chords', 'Autoplay Chords', 'Autoplay Modes', 'Settings', 'Other']
    return order.filter(cat => groups[cat]?.length).map(cat => ({ name: cat, features: groups[cat]! }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuresList, isEnabled, getFeatureConfig])

  const tierColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-600 border-gray-200',
    entry: 'bg-sky-50 text-sky-700 border-sky-200',
    standard: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    premium: 'bg-purple-50 text-purple-700 border-purple-200'
  }

  return (
<div className="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased text-gray-900"><div className="p-8 max-w-4xl mx-auto"><div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Feature Flags</h1><p className="text-gray-500 mt-2">Manage application feature toggles and overrides.</p></div><div className="flex gap-3"><button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" onClick={resetFeatures}>Reset Defaults</button><Link className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm" href="/settings">Back to Settings</Link></div></div><div className="space-y-8">{vfor(groupedFeatures, (group, _i) => (<section key={group.name}><h2 className="text-lg font-bold text-gray-400 mb-4 px-1 uppercase tracking-wider flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />{group.name}</h2><div className="grid gap-3">{vfor(group.features, (feature, _i) => (<div key={feature.key} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between transition-all hover:shadow-md hover:border-blue-200 group"><div className="flex flex-col"><div className="flex items-center gap-2 mb-1"><span className="font-bold text-gray-900">{feature.description}</span><span className={vcls("text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border", tierColors[feature.tier] || tierColors['free'])}>{feature.tier}</span></div><code className="text-xs font-mono text-gray-400 group-hover:text-blue-500 transition-colors">{feature.key}</code></div><div className="flex items-center gap-4"><label className="relative inline-flex items-center cursor-pointer"><input className="sr-only peer" type="checkbox" checked={feature.enabled} onChange={(e) => { toggleFeature(feature.key) }} /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" /><span className="ml-3 text-sm font-medium text-gray-500 peer-checked:text-blue-600 transition-colors w-9 text-right inline-block">{feature.enabled ? 'On' : 'Off'}</span></label></div></div>))}</div></section>))}</div></div></div>
  )
}
