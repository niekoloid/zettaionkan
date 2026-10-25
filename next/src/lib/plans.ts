export type Tier = 'free' | 'entry' | 'standard' | 'premium'

/** How many chords each plan can reach. `entry` is a legacy tier and is treated like standard. */
export const MAX_LEVEL: Record<Tier, number> = { free: 3, entry: 9, standard: 9, premium: 14 }

export const maxLevelFor = (tier: Tier, unlimited: boolean) => (unlimited ? 14 : MAX_LEVEL[tier] ?? 3)

export const PLANS = [
  {
    tier: 'free' as const,
    name: '無料',
    monthly: 0,
    yearly: 0,
    points: ['あか・きいろ・あおの3和音まで', 'まいにちレッスンと記録', 'レッスン時刻のカレンダー登録']
  },
  {
    tier: 'standard' as const,
    name: 'スタンダード',
    monthly: 980,
    yearly: 9800,
    points: ['白鍵の9和音まで', '無料プランのすべて']
  },
  {
    tier: 'premium' as const,
    name: 'プレミアム',
    monthly: 1980,
    yearly: 15000,
    points: ['黒鍵をふくむ14和音すべて', 'スタンダードのすべて']
  }
]

export const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`
