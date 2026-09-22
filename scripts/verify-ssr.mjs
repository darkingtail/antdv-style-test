import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const installedVersion = JSON.parse(readFileSync(
  new URL(import.meta.resolve('antdv-next/package.json')), 'utf8',
)).version
const installedRuntimeVersion = JSON.parse(readFileSync(
  new URL('../package.json', import.meta.resolve('antdv-style')), 'utf8',
)).version
assert.equal(installedRuntimeVersion, '1.0.0')
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { verifySSR } = await server.ssrLoadModule('/scripts/ssr-fixture.ts')
  const results = await verifySSR()
  assert.equal(results.length, 2)
  for (const result of results) {
    assert.equal(result.antdvNextVersion, installedVersion)
    assert.match(result.html, new RegExp(`class="${result.key}-`))
    assert.ok(result.css.includes(`color:${result.color}`))
    assert.ok(result.css.includes('.ant-btn'))
    assert.ok(result.tags.includes(`data-emotion="${result.key} `))
    assert.ok(!result.css.includes('color:tomato'))
    assert.ok(!result.tags.includes(result.otherKey))
    assert.ok(result.resetCSS.includes(`color:${result.color}`))
    assert.ok(Object.values(result.screens).every(value => value === false))
  }
  console.log(`SSR PASS: real antdv-next ${installedVersion} + published antdv-style ${installedRuntimeVersion}; isolated caches, critical CSS, component CSS, reset/remount, SSR breakpoints.`)
} finally {
  await server.close()
}
