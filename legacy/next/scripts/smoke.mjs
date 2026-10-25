// Smoke test for a running dev/prod server:  npm run dev  (other terminal)  npm run test:smoke
//   BASE_URL=http://localhost:3000   server to test
//   CHROME_PATH=/path/to/chrome      optional (defaults to Playwright's Chromium / system Chrome)
import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const ROUTES = ['/', '/lp', '/about', '/method', '/faq', '/contact', '/company', '/legal', '/privacy', '/terms', '/settings', '/voice-settings',
  '/history', '/auth', '/subscription', '/subscription/success', '/chordquizz', '/autoplay', '/admin/features', '/admin/video-gen']

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, channel: process.env.CHROME_PATH ? undefined : 'chrome' })
let failures = 0
const fail = msg => { failures++; console.log('  ✗', msg) }

// 1. every page renders without runtime errors or broken local assets
for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message.slice(0, 160)))
  page.on('response', res => {
    const u = new URL(res.url())
    if (u.origin === new URL(BASE).origin && res.status() >= 400 && !u.pathname.startsWith('/_next')) errors.push(`${res.status()} ${u.pathname}`)
  })
  const res = await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  console.log(route.padEnd(24), res.status(), errors.length ? '' : 'ok')
  if (res.status() >= 400) fail(`${route} returned ${res.status()}`)
  errors.forEach(e => fail(`${route}: ${e}`))
  await page.close()
}

// 2. quiz flow: select -> start -> answer -> finish -> back to settings
{
  console.log('quiz flow')
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } })
  await page.goto(BASE + '/chordquizz', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: /シレソ/ }).first().click()
  await page.getByText('テストを開始する').click()
  const tiles = page.locator('main div.grid > button')
  if ((await tiles.count()) !== 3) fail('expected 3 answer tiles after selecting level 3')
  await tiles.first().click()
  await page.waitForTimeout(1500)
  if ((await page.getByText(/^Q 2$/).count()) !== 1) fail('did not advance to Q 2')
  await page.getByText('テストを終了').click()
  if (!(await page.getByText('設定に戻る').isVisible())) fail('result view not shown')
  await page.getByText('設定に戻る').click()
  if (!(await page.getByText('テストを開始する').isVisible())) fail('did not return to settings')
  await page.close()
}

// 3. home: locked chord opens the PRO modal
{
  console.log('home pro modal')
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } })
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: /^10番/ }).click()
  if (!(await page.getByText('PROプランを見る').isVisible())) fail('PRO modal did not open')
  await page.close()
}

await browser.close()
console.log(failures ? `\n${failures} failure(s)` : '\nall smoke checks passed')
process.exit(failures ? 1 : 0)
