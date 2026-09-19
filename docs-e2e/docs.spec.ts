import { test, expect } from '@playwright/test'

const cases = [
  { path: 'api/style-provider', id: 'engine-box', action: 'speedy' },
  { path: 'api/theme-provider', id: 'custom-theme-preview', action: 'custom' },
  { path: 'best-practice/mac-select', id: 'mac-select', action: 'select' },
  { path: 'best-practice/clay', id: 'clay-panel', action: 'clay' },
  { path: 'guide/performance-comparsion', id: 'benchmark-run', action: 'benchmark' },
]

for (const locale of ['', 'en/']) {
  for (const item of cases) {
    test(`${locale || 'zh/'}${item.path}`, async ({ page }, testInfo) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => {
        if (/hydration.*mismatch/i.test(message.text())) errors.push(message.text())
      })
      const response = await page.goto(`/antdv-style/${locale}${item.path}`)
      expect(response?.status()).toBe(200)
      await expect(page.getByTestId(item.id)).toBeVisible()
      if (item.action === 'speedy') {
        await page.getByTestId('speedy').check()
        await expect(page.getByTestId('engine-box')).toHaveCSS('color', 'rgb(10, 100, 90)')
      } else if (item.action === 'custom') {
        await page.getByTestId('custom-spacing').focus()
        await page.getByTestId('custom-spacing').press('End')
        await expect(page.getByTestId('custom-theme-preview')).toHaveCSS('padding-top', '32px')
      } else if (item.action === 'select') {
        await page.getByTestId('mac-select').getByRole('combobox').click()
        await page.locator('.ant-select-item-option').filter({ hasText: 'Dark' }).click()
        await expect(page.getByTestId('mac-value')).toHaveText('dark')
        await page.getByTestId('mac-select').getByRole('combobox').press('Escape')
        await expect(page.getByTestId('mac-select').getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
      } else if (item.action === 'clay') {
        await page.getByTestId('clay-add').click()
        await expect(page.getByTestId('clay-count')).toHaveText('1')
      } else {
        await page.getByTestId('benchmark-run').click()
        await expect(page.getByTestId('benchmark-cold-rules')).toHaveText('100')
        await expect(page.getByTestId('benchmark-warm-rules')).toHaveText('100')
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      expect(errors).toEqual([])
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ path: testInfo.outputPath('docs.png'), fullPage: true, animations: 'disabled' })
    })
  }
}
