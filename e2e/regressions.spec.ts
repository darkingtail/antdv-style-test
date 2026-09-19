import { test, expect, type Page } from '@playwright/test'

const pageErrors = new WeakMap<Page, string[]>()
test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  pageErrors.set(page, errors)
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/?regression')
  await expect(page.getByTestId('mode-state')).toHaveText('light')
})

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([])
})

test('controlled mode and appearance requests update CSS exactly once', async ({ page }) => {
  await expect(page.getByTestId('mode-box')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.getByTestId('mode-dark').click()
  await expect(page.getByTestId('mode-state')).toHaveText('dark')
  await expect(page.getByTestId('mode-events')).toHaveText('1')
  await expect(page.getByTestId('mode-box')).toHaveCSS('background-color', 'rgb(20, 20, 20)')
  await page.getByTestId('appearance-dark').click()
  await expect(page.getByTestId('appearance-state')).toHaveText('dark')
  await expect(page.getByTestId('appearance-mode')).toHaveText('light')
  await expect(page.getByTestId('appearance-events')).toHaveText('1')
})

test('parents can reject controlled requests without changing effective state', async ({ page }) => {
  await page.getByTestId('accept-requests').uncheck()
  await page.getByTestId('mode-dark').click()
  await page.getByTestId('appearance-dark').click()
  await expect(page.getByTestId('mode-events')).toHaveText('1')
  await expect(page.getByTestId('appearance-events')).toHaveText('1')
  await expect(page.getByTestId('mode-state')).toHaveText('light')
  await expect(page.getByTestId('appearance-state')).toHaveText('light')
  await page.getByTestId('accept-requests').check()
  await page.getByTestId('mode-dark').click()
  await expect(page.getByTestId('mode-state')).toHaveText('dark')
  await expect(page.getByTestId('mode-events')).toHaveText('2')
})

test('auto mode follows real browser color scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.getByTestId('mode-auto').click()
  await expect(page.getByTestId('mode-mode')).toHaveText('auto')
  await expect(page.getByTestId('mode-state')).toHaveText('dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.getByTestId('mode-state')).toHaveText('light')
  await expect(page.getByTestId('mode-events')).toHaveText('1')
})

test('custom breakpoints stay isolated, update dynamically and respond to resize', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 900 })
  const state = async (name: string) => JSON.parse(await page.getByTestId(`${name}-breakpoints`).innerText())
  await expect.poll(async () => (await state('default')).md).toBe(true)
  await expect.poll(async () => (await state('custom')).md).toBe(true)
  await expect.poll(async () => (await state('theme')).md).toBe(false)
  await page.getByTestId('change-breakpoint').click()
  await expect.poll(async () => (await state('custom')).md).toBe(false)
  await expect.poll(async () => (await state('default')).md).toBe(true)
  await page.setViewportSize({ width: 375, height: 812 })
  for (const name of ['default', 'custom', 'theme']) {
    await expect.poll(async () => (await state(name)).mobile).toBe(true)
    expect((await state(name)).tablet).toBe(false)
  }
  await page.setViewportSize({ width: 1700, height: 900 })
  await expect.poll(async () => (await state('theme')).desktop).toBe(true)
})

test('ShadowRoot receives both Emotion and component CSS', async ({ page }) => {
  await expect(page.getByTestId('shadow-box')).toHaveCSS('color', 'rgb(120, 30, 160)')
  await expect(page.getByTestId('shadow-button')).toHaveCSS('background-color', 'rgb(22, 119, 255)')
  const styleCounts = await page.getByTestId('shadow-host').evaluate(host => ({
    emotion: host.shadowRoot!.querySelectorAll('style[data-emotion^="shadow-proof"]').length,
    antd: host.shadowRoot!.querySelectorAll('style[data-css-hash]').length,
    leaked: document.head.querySelectorAll('style[data-emotion^="shadow-proof"]').length,
  }))
  expect(styleCounts.emotion).toBeGreaterThan(0)
  expect(styleCounts.antd).toBeGreaterThan(0)
  expect(styleCounts.leaked).toBe(0)
})

test('reset and remount reinserts cached rules repeatedly', async ({ page }) => {
  const box = page.getByTestId('reset-box')
  const className = await box.getAttribute('class')
  for (let count = 0; count < 3; count++) {
    await expect(box).toHaveCSS('color', 'rgb(221, 160, 221)')
    await expect(box).toHaveCSS('border-top-width', '3px')
    await expect(box).toHaveAttribute('class', className!)
    await page.getByTestId('reset').click()
    await expect(page.getByTestId('reset-count')).toHaveText(String(count + 1))
  }
  await expect(box).toHaveCSS('color', 'rgb(221, 160, 221)')
})

test('container, insertion point, nonce and speedy CSSOM work', async ({ page }) => {
  const verify = async (speedy: boolean) => {
    await expect(page.getByTestId('engine-box')).toHaveCSS('color', 'rgb(10, 100, 90)')
    const result = await page.getByTestId('engine-container').evaluate(container => {
      const styles = Array.from(container.querySelectorAll<HTMLStyleElement>('style[data-emotion^="container-proof"]'))
      return {
        first: styles[0]?.previousElementSibling?.getAttribute('data-testid'),
        nonces: styles.map(style => style.nonce),
        text: styles.map(style => style.textContent).join(''),
        rules: styles.reduce((sum, style) => sum + (style.sheet?.cssRules.length ?? 0), 0),
      }
    })
    expect(result.first).toBe('insertion-point')
    expect(result.nonces.length).toBeGreaterThan(0)
    expect(result.nonces.every(nonce => nonce === 'local-proof')).toBe(true)
    expect(result.rules).toBeGreaterThan(0)
    if (speedy) expect(result.text).toBe('')
    else expect(result.text).toContain('color:rgb(10, 100, 90)')
  }
  await verify(false)
  await page.getByTestId('speedy').check()
  await verify(true)
})

test('MacSelect docs demo supports pointer and keyboard selection', async ({ page }) => {
  const select = page.getByTestId('mac-select').getByRole('combobox')
  await select.focus()
  await select.press('ArrowDown')
  await expect(select).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('.ant-select-item-option-active')).toHaveText('System')
  await select.press('ArrowDown')
  await expect(page.locator('.ant-select-item-option-active')).toHaveText('Light')
  await select.press('Enter')
  await expect(page.getByTestId('mac-value')).toHaveText('light')
  await expect(select).toHaveAttribute('aria-expanded', 'false')
  await select.click()
  await page.locator('.ant-select-item-option').filter({ hasText: 'Dark' }).click()
  await expect(page.getByTestId('mac-value')).toHaveText('dark')
  await select.press('ArrowDown')
  await expect(select).toHaveAttribute('aria-expanded', 'true')
  await select.press('Escape')
  await expect(select).toHaveAttribute('aria-expanded', 'false')
})

test('custom theme demo updates generic instance tokens', async ({ page }) => {
  const preview = page.getByTestId('custom-theme-preview')
  await expect(preview).toHaveCSS('border-top-color', 'rgb(0, 121, 107)')
  await page.getByTestId('custom-accent').evaluate(element => {
    (element as HTMLInputElement).value = '#ee2200'
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await expect(preview).toHaveCSS('border-top-color', 'rgb(238, 34, 0)')
  await page.getByTestId('custom-spacing').focus()
  await page.getByTestId('custom-spacing').press('End')
  await expect(preview).toHaveCSS('padding-top', '32px')
})

test('benchmark reports real cache counts and disposes its rules', async ({ page }) => {
  await page.getByTestId('benchmark-run').click()
  await expect(page.getByTestId('benchmark-cold-rules')).toHaveText('100')
  await expect(page.getByTestId('benchmark-warm-rules')).toHaveText('100')
  const times = await page.getByTestId('benchmark-result').locator('tbody tr td:nth-child(2)').allTextContents()
  expect(times.every(value => Number.isFinite(Number(value)) && Number(value) >= 0)).toBe(true)
  expect(await page.locator('style[data-emotion^="docs-benchmark"]').count()).toBe(0)
})

test('Clay docs demo is interactive and theme-aware', async ({ page }) => {
  const panel = page.getByTestId('clay-panel')
  await expect(panel).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.getByTestId('clay-add').click()
  await expect(page.getByTestId('clay-count')).toHaveText('1')
  await page.getByTestId('clay-theme').click()
  await expect(panel).toHaveCSS('background-color', 'rgb(20, 20, 20)')
  expect(await panel.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe('none')
})

test('regression page has no horizontal overflow and renders a screenshot', async ({ page }, testInfo) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('regressions.png'), fullPage: true })
})
