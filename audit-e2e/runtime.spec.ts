import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'

const observations = JSON.parse(readFileSync(new URL('../audit-generated/results.json', import.meta.url), 'utf8'))

test('documented props getter remains reactive', async ({ page }) => {
  await page.goto('/scripts/audit-browser.html')
  await expect(page.getByTestId('getter')).toHaveCSS('color', 'rgb(11, 22, 33)')
  await page.getByTestId('change-color').click()
  await expect(page.getByTestId('getter')).toHaveCSS('color', 'rgb(44, 55, 66)')
})

test('external reactive state passed through a getter updates styles', async ({ page }) => {
  await page.goto('/scripts/audit-browser.html')
  await expect(page.getByTestId('closure')).toHaveCSS('color', 'rgb(11, 22, 33)')
  await page.getByTestId('change-color').click()
  await expect(page.getByTestId('closure')).toHaveCSS('color', 'rgb(44, 55, 66)')
})

test('codemod preserves the existing normal-script setup result', async ({ page }) => {
  expect(observations.setup.changed).toBe(false)
  expect(observations.setup.diagnostics.length).toBeGreaterThan(0)
  await page.goto('/scripts/audit-browser.html')
  await expect(page.getByTestId('before')).toHaveText('existing setup')
  await expect(page.getByTestId('after')).toHaveText('existing setup')
})

for (const payload of observations.runtime.payloads) {
  test(`SSR style text preserves CSS without executing markup: ${payload.content.slice(0, 8)}`, async ({ page }) => {
    await page.setContent(`<!doctype html><html><head>${payload.tags}</head><body><div id="probe" class="${payload.className}"></div></body></html>`)
    expect(await page.evaluate(() => (globalThis as any).__antdvAuditExecuted)).toBeUndefined()
    await expect(page.locator('script')).toHaveCount(0)
    await expect(page.locator('style')).toHaveCount(1)
    await expect(page.locator('#probe')).toHaveCSS('color', 'rgb(1, 2, 3)')
    const contents = await page.evaluate(({ css }) => {
      const probe = document.getElementById('probe')!
      const serialized = getComputedStyle(probe).content
      // textContent does not run the HTML parser; it is the raw-CSS control.
      document.querySelector('style')!.textContent = css
      return { serialized, raw: getComputedStyle(probe).content }
    }, payload)
    expect(contents.serialized).toBe(JSON.stringify(payload.content))
    expect(contents.serialized).toBe(contents.raw)
  })
}

test('the label plugin preserves a label supplied through shared options', () => {
  expect(observations.plugin.options.label).toBe('manual-label')
})

test('codemod refuses Less arithmetic in media parameters', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 900, height: 700 })
  await page.goto('/scripts/audit-browser.html')
  const query = '(min-width: (500px + 100px))'
  const media = await page.evaluate(value => ({
    originalMatches: window.matchMedia(value).matches,
    compiledMatches: window.matchMedia('(min-width: 600px)').matches,
  }), query)
  await testInfo.attach('media-query', { body: JSON.stringify(media), contentType: 'application/json' })
  expect(media.compiledMatches).toBe(true)
  expect(media.originalMatches).toBe(false)
  expect(observations.media.changed).toBe(false)
})

test('px2rem leaves URLs and quoted content intact', () => {
  expect(observations.runtime.px2rem).toBe('background:url("/assets/icon-16px.png");content:"16px";padding:1rem')
})
