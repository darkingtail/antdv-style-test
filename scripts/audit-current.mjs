import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'
import { transformStyleLabels } from 'vite-plugin-antdv-style'
import { transformVueSfcLess } from '@antdv-next/less2cssinjs'

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  const { inspectRuntime } = await server.ssrLoadModule('/scripts/audit-runtime-fixture.ts')
  const runtime = await inspectRuntime()
  const source = `import { createStyles } from 'antdv-style'
const shared = { label: 'manual-label' }
const useStyles = createStyles(() => ({}), { ...shared })`
  const transformed = transformStyleLabels(source, '/src/audit.ts')
  const pluginCode = transformed?.code ?? source
  const plugin = {
    code: pluginCode,
    options: Function('createStyles', `${pluginCode.replace(/^import[^\n]*\n/, '')}; return useStyles`)(
      (_factory, options) => options,
    ),
  }
  const mediaSource = '<template><div :class="$style.root" /></template><style module lang="less">.root { @media (min-width: (500px + 100px)) { color: red; } }</style>'
  const media = transformVueSfcLess(mediaSource, 'Media.vue')
  const normalScript = `<script lang="ts">
export default { setup() { return { title: 'existing setup' } } }
</script>
<template><div :class="$style.root">{{ title }}</div></template>
<style module lang="less">.root { color: red; }</style>`
  const setup = transformVueSfcLess(normalScript, 'Setup.vue')
  assert.equal(media.changed, false)
  assert.equal(media.code, mediaSource)
  assert.ok(media.diagnostics.length > 0)
  assert.equal(setup.changed, false)
  assert.equal(setup.code, normalScript)
  assert.ok(setup.diagnostics.some(item => /setup/i.test(item.message)))
  const results = { runtime, plugin, media, setup }
  const directory = new URL('../audit-generated/', import.meta.url)
  mkdirSync(directory, { recursive: true })
  writeFileSync(new URL('results.json', directory), JSON.stringify(results, null, 2))
  writeFileSync(new URL('SetupBefore.vue', directory), normalScript.replace(' lang="less"', ''))
  // The refused source is identical. This fixture uses CSS-only syntax, so both
  // browser copies omit the Less flag without requiring a Less compiler.
  writeFileSync(new URL('SetupAfter.vue', directory), setup.code.replace(' lang="less"', ''))
  console.log(JSON.stringify(results, null, 2))
} finally {
  await server.close()
}
