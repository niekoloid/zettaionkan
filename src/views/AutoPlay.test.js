import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AutoPlay from './AutoPlay.vue'
import { nextTick, ref } from 'vue'

const mocks = vi.hoisted(() => ({
  isSamplerLoadedValue: true,
  isLoadingValue: false,
  loadingProgressValue: 100,
  selectedInstrumentValue: 'yamaha',
  userValue: { id: 'test-user' },
  userTierValue: 'free'
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useRoute: () => ({
    query: {},
  }),
  onBeforeRouteLeave: vi.fn(),
}))

// Mock Tone.js
vi.mock('tone', () => ({
  start: vi.fn().mockResolvedValue(),
  context: {
    state: 'suspended',
  },
}))

// Mock composables
vi.mock('../composables/useAudio', () => {
  const { ref } = require('vue')
  return {
    useAudio: () => ({
      samplers: { yamaha: { triggerAttackRelease: vi.fn() } },
      isLoading: ref(mocks.isLoadingValue),
      loadingProgress: ref(mocks.loadingProgressValue),
      isSamplerLoaded: ref(mocks.isSamplerLoadedValue),
      selectedInstrument: ref(mocks.selectedInstrumentValue),
      loadSampler: vi.fn(),
    })
  }
})

vi.mock('../composables/useAuth', () => {
  const { ref } = require('vue')
  return {
    useAuth: () => ({
      user: ref(mocks.userValue),
      userTier: ref(mocks.userTierValue),
      authReady: Promise.resolve(),
    })
  }
})

vi.mock('../composables/useAudioSettings', () => ({
  useAudioSettings: () => ({
    getPreferredInstrument: () => 'yamaha',
  }),
}))

// Mock SpeechSynthesis
const mockSpeak = vi.fn()
const mockCancel = vi.fn()
global.window.speechSynthesis = {
  speak: mockSpeak,
  cancel: mockCancel,
  cancel: vi.fn(),
}
global.SpeechSynthesisUtterance = vi.fn()

describe('AutoPlay.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('renders settings view initially', () => {
    const wrapper = mount(AutoPlay)
    expect(wrapper.text()).toContain('和音の聞き流し')
    // Find the button that specifically contains the start text
    const startButton = wrapper.findAll('button').find(b => b.text().includes('自動再生を開始する'))
    expect(startButton.exists()).toBe(true)
  })

  it('starts autoplay when the start button is clicked', async () => {
    const wrapper = mount(AutoPlay)
    
    // Find and click the start button
    const buttons = wrapper.findAll('button')
    const startButton = buttons.find(b => b.text().includes('自動再生を開始する'))
    await startButton.trigger('click')
    
    // Multiple nextTicks to ensure async startAutoPlay (with Tone.start) completes
    await nextTick()
    await nextTick()
    await nextTick()
    
    // State 'view' should be 'playing', and '停止する' button should exist
    expect(wrapper.text()).toContain('停止する')

    // Fast-forward timers for playCurrentQuestion
    vi.runOnlyPendingTimers()
    
    // Check if Tone.start was called
    const Tone = await import('tone')
    expect(Tone.start).toHaveBeenCalled()
  })

  it('can toggle the voice reading setting', async () => {
    const wrapper = mount(AutoPlay)
    
    // Find the toggle container by its text
    const containers = wrapper.findAll('div.cursor-pointer')
    const voiceToggle = containers.find(d => d.text().includes('色の名前を読み上げる'))
    expect(voiceToggle.exists()).toBe(true)

    // The switch itself (has transition-colors and bg-gray-900 when ON)
    const toggleSwitch = voiceToggle.find('.bg-gray-900')
    expect(toggleSwitch.exists()).toBe(true)

    // Click to toggle OFF
    await voiceToggle.trigger('click')
    await nextTick()
    
    // Now it should NOT have bg-gray-900 on that switch
    expect(voiceToggle.find('.bg-gray-900').exists()).toBe(false)

    // Click back ON
    await voiceToggle.trigger('click')
    await nextTick()
    expect(voiceToggle.find('.bg-gray-900').exists()).toBe(true)
  })
})
