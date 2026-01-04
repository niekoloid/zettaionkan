import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SingleNoteQuizz from './SingleNoteQuizz.vue'
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
  onBeforeRouteLeave: vi.fn(),
}))

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mocks.userValue } }),
    },
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
  },
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

// Mock ScoreDisplay to avoid abcjs issues
vi.mock('../components/ScoreDisplay.vue', () => ({
  default: {
    name: 'ScoreDisplay',
    template: '<div class="score-display-mock"><slot name="footer" /></div>',
    props: ['abc', 'clef', 'isAnswered']
  }
}))

describe('SingleNoteQuizz.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('renders settings view initially', () => {
    const wrapper = mount(SingleNoteQuizz)
    expect(wrapper.text()).toContain('単音テスト')
    const startButton = wrapper.findAll('button').find(b => b.text().includes('テストを開始する'))
    expect(startButton.exists()).toBe(true)
  })

  it('starts quiz when the start button is clicked', async () => {
    const wrapper = mount(SingleNoteQuizz)
    
    const startButton = wrapper.findAll('button').find(b => b.text().includes('テストを開始する'))
    await startButton.trigger('click')
    
    await nextTick()
    await nextTick()
    
    expect(wrapper.text()).toContain('Question')
    expect(wrapper.text()).toContain('スキップ')
    expect(wrapper.text()).toContain('再再生')
  })

  it('toggles white keys only setting', async () => {
    const wrapper = mount(SingleNoteQuizz)
    
    const toggle = wrapper.findAll('div.cursor-pointer').find(d => d.text().includes('白鍵のみをテストする'))
    expect(toggle.exists()).toBe(true)

    // Default is ON (bg-indigo-600)
    expect(toggle.find('.bg-indigo-600').exists()).toBe(true)

    await toggle.trigger('click')
    await nextTick()
    
    expect(toggle.find('.bg-indigo-600').exists()).toBe(false)
  })

  it('toggles octave matching setting', async () => {
    const wrapper = mount(SingleNoteQuizz)
    
    const toggle = wrapper.findAll('div.cursor-pointer').find(d => d.text().includes('オクターブまで一致させる'))
    expect(toggle.exists()).toBe(true)

    // Default is ON (bg-indigo-600)
    expect(toggle.find('.bg-indigo-600').exists()).toBe(true)

    await toggle.trigger('click')
    await nextTick()
    
    expect(toggle.find('.bg-indigo-600').exists()).toBe(false)
  })
})
