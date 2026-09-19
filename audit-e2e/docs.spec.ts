import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from '@playwright/test'

const root = fileURLToPath(new URL('../../antdv-style/docs/', import.meta.url))
function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name === 'superpowers') return []
    const path = join(directory, entry.name)
    return entry.isDirectory() ? markdownFiles(path) : entry.name.endsWith('.md') ? [path] : []
  })
}
const routes = markdownFiles(root).map(path => {
  const name = relative(root, path).replaceAll('\\', '/').replace(/\.md$/, '')
  return `/antdv-style/${name.replace(/(?:^|\/)index$/, match => match.startsWith('/') ? '/' : '')}`
}).sort()
const normalize = (value: string) => value.replace(/\.html$/, '').replace(/\/$/, '')
const knownRoutes = new Set(routes.map(normalize))

for (const route of routes) {
  test(`page and internal links ${route}`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (/hydration.*mismatch|failed to resolve component/i.test(message.text())) errors.push(message.text())
    })
    const response = await page.goto(route)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('.VPNav')).toBeVisible()
    const document = await page.evaluate(() => ({
      links: Array.from(window.document.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .map(link => ({ href: link.href, text: link.textContent?.trim() })),
      ids: Array.from(window.document.querySelectorAll('[id]')).map(element => element.id),
      horizontalOverflow: window.document.documentElement.scrollWidth > window.innerWidth + 1,
    }))
    const invalid: string[] = []
    for (const link of document.links) {
      const url = new URL(link.href)
      if (url.origin !== new URL(page.url()).origin || !url.pathname.startsWith('/antdv-style/')) continue
      if (/\.(?:png|jpe?g|svg|webp|gif|zip|tgz|pdf)$/.test(url.pathname)) continue
      if (!knownRoutes.has(normalize(url.pathname))) invalid.push(`${link.text}: ${url.pathname}`)
      if (normalize(url.pathname) === normalize(route) && url.hash && url.hash !== '#') {
        if (!document.ids.includes(decodeURIComponent(url.hash.slice(1)))) invalid.push(`${link.text}: ${url.hash}`)
      }
    }
    await testInfo.attach('page-audit', { body: JSON.stringify({ route, ...document, errors, invalid }), contentType: 'application/json' })
    expect(errors).toEqual([])
    expect(invalid).toEqual([])
    expect(document.horizontalOverflow).toBe(false)
  })
}
