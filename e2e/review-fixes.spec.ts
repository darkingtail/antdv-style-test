import { expect, test, type Page } from '@playwright/test'

const errors = new WeakMap<Page, string[]>()
test.beforeEach(async ({ page }) => {
  const messages: string[] = []
  errors.set(page, messages)
  page.on('pageerror', error => messages.push(error.message))
  page.on('console', message => { if (message.type() === 'error') messages.push(message.text()) })
  await page.goto('/?review-fixes')
  await expect(page.getByRole('heading', { name: 'Review Regression Tests' })).toBeVisible()
})
test.afterEach(async ({ page }) => { expect(errors.get(page)).toEqual([]) })

test('built Vite plugin compiles TypeScript assertions and adds labels', async ({ page }) => {
  await expect(page.getByTestId('ts-assertion')).toHaveCSS('width', '37px')
  await expect(page.getByTestId('sfc-assertion')).toHaveCSS('opacity', '0.75')
  await expect(page.getByTestId('ts-assertion')).toHaveAttribute('class', /useAssertionStyles/)
  await expect(page.getByTestId('sfc-assertion')).toHaveAttribute('class', /useSfcAssertionStyles/)
})

test('static and factory styles merge with default cx in argument order', async ({ page }) => {
  for (const id of ['static-red-blue', 'factory-red-blue']) {
    await expect(page.getByTestId(id)).toHaveCSS('color', 'rgb(0, 0, 255)')
    expect((await page.getByTestId(id).getAttribute('class'))!.trim().split(/\s+/)).toHaveLength(1)
  }
  await expect(page.getByTestId('static-blue-red')).toHaveCSS('color', 'rgb(255, 0, 0)')
})

test('variable references match real component tokens for every prefix source', async ({ page }) => {
  for (const [name, prefix] of [
    ['prefix', 'acme'], ['explicit', 'brand'], ['inherited', 'host'],
    ['nested', 'outer'], ['instance', 'instance-vars'],
  ]) {
    await expect(page.getByTestId(`${name}-button`)).toHaveCSS('background-color', 'rgb(225, 35, 69)')
    await expect(page.getByTestId(`${name}-variable`)).toHaveCSS('color', 'rgb(225, 35, 69)')
    await expect(page.getByTestId(`${name}-variable`)).toHaveAttribute('data-reference', new RegExp(`^var\\(--${prefix}-color-primary`))
  }
  const classes = await Promise.all(['nested', 'instance', 'dynamic'].map(name =>
    page.getByTestId(`${name}-button`).getAttribute('class')))
  const hashes = classes.map(value => value?.match(/\bcss(?:-dev-only-do-not-override)?-(?!var-)[\w-]+/)?.[0])
  expect(hashes.every(Boolean)).toBe(true)
  expect(new Set(hashes).size).toBe(3)
})

test('variable-prefix-only updates invalidate styles and keep token updates reactive', async ({ page }) => {
  const variable = page.getByTestId('dynamic-variable')
  let previousClass = await variable.getAttribute('class')
  for (const prefix of ['second', 'third']) {
    await page.getByTestId('change-variable-prefix').click()
    await expect(variable).toHaveAttribute('data-reference', new RegExp(`^var\\(--${prefix}-color-primary`))
    await expect(variable).not.toHaveAttribute('class', previousClass!)
    await expect(variable).toHaveCSS('color', 'rgb(225, 35, 69)')
    await expect(page.getByTestId('dynamic-button')).toHaveCSS('background-color', 'rgb(225, 35, 69)')
    await expect(page.getByTestId('nested-button')).toHaveCSS('background-color', 'rgb(225, 35, 69)')
    previousClass = await variable.getAttribute('class')
  }
  await page.getByTestId('change-variable-token').click()
  await expect(variable).toHaveCSS('color', 'rgb(0, 121, 107)')
  await expect(page.getByTestId('dynamic-button')).toHaveCSS('background-color', 'rgb(0, 121, 107)')
})

test('explicit hash opt-out and local override of an un-hashed ancestor both work', async ({ page }) => {
  const hash = /\bcss(?:-dev-only-do-not-override)?-(?!var-)[\w-]+/
  await expect(page.getByTestId('optout-button')).not.toHaveAttribute('class', hash)
  await expect(page.getByTestId('optout-button')).toHaveCSS('background-color', 'rgb(225, 35, 69)')
  await expect(page.getByTestId('hash-override-button')).toHaveAttribute('class', hash)
  await expect(page.getByTestId('hash-override-button')).toHaveCSS('background-color', 'rgb(225, 35, 69)')
})

test('native ConfigProvider with hashing isolates simultaneous and dynamic prefixes', async ({ page }) => {
  await page.goto('/?review-fixes&upstream-only&hashed')
  await expect(page.getByTestId('pure-first')).toHaveCSS('background-color', 'rgb(225, 35, 69)')
  await expect(page.getByTestId('pure-second')).toHaveCSS('background-color', 'rgb(225, 35, 69)')
  const before = await page.getByTestId('pure-first').getAttribute('class')
  await page.getByTestId('pure-change-prefix').click()
  await expect(page.getByTestId('pure-first')).not.toHaveAttribute('class', before!)
  await expect(page.getByTestId('pure-first')).toHaveCSS('background-color', 'rgb(225, 35, 69)')
  await expect(page.getByTestId('pure-second')).toHaveCSS('background-color', 'rgb(225, 35, 69)')
})

for (const placement of ['append', 'prepend', 'insertion', 'speedy']) {
  test(`global ${placement} cascade remains stable across update, empty result and restore`, async ({ page }) => {
    const target = page.getByTestId(`global-${placement}-target`)
    const container = page.locator(`[data-global-container="${placement}"]`)
    const rules = () => container.locator('style[data-antdv-global]').evaluateAll(styles =>
      styles.map(style => style.textContent || [...((style as HTMLStyleElement).sheet?.cssRules ?? [])]
        .map(rule => rule.cssText).join('')).join('').replace(/\s/g, ''))
    // Placement selects the engine's position, not the relative order of its owners.
    await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)')
    await expect.poll(rules).toMatch(/color:(red|rgb\(255,0,0\))/)
    await page.getByTestId(`global-${placement}-update`).click()
    await expect.poll(rules).toMatch(/color:(green|rgb\(0,128,0\))/)
    await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)')
    await page.getByTestId(`global-${placement}-clear`).click()
    await expect.poll(rules).not.toMatch(/color:(green|rgb\(0,128,0\))/)
    await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)')
    await page.getByTestId(`global-${placement}-restore`).click()
    await expect.poll(rules).toMatch(/color:(purple|rgb\(128,0,128\))/)
    await expect(target).toHaveCSS('color', 'rgb(0, 0, 255)')
    expect(await container.locator('style[data-antdv-global]').count()).toBeGreaterThan(0)
    expect(await container.locator('style[data-antdv-global]').evaluateAll(styles =>
      styles.every(style => (style as HTMLStyleElement).nonce === 'review-proof'))).toBe(true)
    await page.getByTestId('unmount-globals').click()
    await expect(container.locator('style')).toHaveCount(0)
    await expect(container.locator('[data-antdv-global-anchor]')).toHaveCount(0)
  })
}

test('documented toRefs pattern updates rendered styles with props and tokens', async ({ page }) => {
  const probe = page.getByTestId('reactive-doc-example')
  await expect(probe).toHaveCSS('color', 'rgb(17, 17, 17)')
  await page.getByTestId('change-doc-prop').click()
  await expect(probe).toHaveCSS('color', 'rgb(225, 35, 69)')
  await page.getByTestId('change-doc-token').click()
  await expect(probe).toHaveCSS('color', 'rgb(0, 121, 107)')
})

test('review scenarios fit the viewport', async ({ page }, testInfo) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('review-fixes.png'), fullPage: true })
})
