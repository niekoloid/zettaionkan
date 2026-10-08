import { vcls, vfor } from '@/lib/vue-compat'

describe('vcls (Vue class binding)', () => {
  it('joins strings, arrays and objects and drops falsy values', () => {
    expect(vcls('a', ['b', false, null, undefined, '', 'c'], { d: true, e: false })).toBe('a b c d')
    expect(vcls(null, 'x')).toBe('x')
  })
})

describe('vfor (v-for)', () => {
  it('maps arrays with index', () => expect(vfor(['a', 'b'], (v, i) => `${i}${v}`)).toEqual(['0a', '1b']))
  it('counts 1..n for numbers like Vue', () => expect(vfor(3, n => n)).toEqual([1, 2, 3]))
  it('tolerates null', () => expect(vfor(null, () => 1)).toEqual([]))
})
