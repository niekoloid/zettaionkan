'use client'

import type { ReactNode } from 'react'
import { AppProvider, type InitialState } from '@/lib/app-context'
import { AudioProvider } from '@/lib/audio'
import { VoiceProvider } from '@/lib/voice'
import AudioLoadingStatus from '@/components/AudioLoadingStatus'
import ProModal from '@/components/common/ProModal'

export default function Providers({ initial, children }: { initial: InitialState; children: ReactNode }) {
  return (
    <AppProvider initial={initial}>
      <VoiceProvider>
      <AudioProvider>
        <div className="relative min-h-screen">
          {children}
          <AudioLoadingStatus />
          <ProModal />
        </div>
      </AudioProvider>
      </VoiceProvider>
    </AppProvider>
  )
}
