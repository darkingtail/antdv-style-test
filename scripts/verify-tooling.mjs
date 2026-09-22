import assert from 'node:assert/strict'
import { readFileSync, realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { antdvStyleLabel, transformStyleLabels } from 'vite-plugin-antdv-style'
import { transformVueSfcLess, transformLessToCreateStyles } from '@antdv-next/less2cssinjs'

const runtimePath = realpathSync('node_modules/antdv-style')
const siblingRuntimePath = realpathSync('../antdv-style')
const runtimePackage = JSON.parse(readFileSync('node_modules/antdv-style/package.json', 'utf8'))
assert.equal(runtimePackage.version, '1.0.0')
assert.notEqual(runtimePath, siblingRuntimePath)
await assert.rejects(import('antdv-style/vite'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' })
await assert.rejects(import('antdv-style/codemod'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' })
await assert.rejects(import('antdv-style/vite-plugin'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' })
await assert.rejects(import('antdv-style/less2cssinjs'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' })
assert.equal(realpathSync('node_modules/vite-plugin-antdv-style'), realpathSync('../antdv-style/packages/vite-plugin-antdv-style'))
assert.equal(realpathSync('node_modules/@antdv-next/less2cssinjs'), realpathSync('../antdv-style/packages/less2cssinjs'))
assert.equal(antdvStyleLabel().name, 'vite-plugin-antdv-style')
let checks = 9
const script = `import { createStyles } from 'antdv-style'
const n = <number>1
const useStyles = createStyles(() => ({ root: { opacity: n } }))`
for (const extension of ['ts', 'cts', 'mts']) {
  assert.match(transformStyleLabels(script, `Card.${extension}`).code, /label: "useStyles"/)
  checks++
}
for (const tag of ['script', 'script setup']) {
  const sfc = `<${tag} lang="ts">${script}</script><template><div /></template>`
  assert.match(transformStyleLabels(sfc, 'Card.vue').code, /label: "useStyles"/)
  checks++
}
for (const lang of ['jsx', 'tsx']) {
  const source = `import { createStyles } from 'antdv-style'
const render = () => <div />
const useStyles = createStyles(() => ({}))`
  assert.match(transformStyleLabels(source, `Card.${lang}`).code, /label: "useStyles"/)
  assert.match(transformStyleLabels(`<script setup lang="${lang}">${source}</script>`, 'Card.vue').code, /label: "useStyles"/)
  checks += 2
}
for (const value of [
  'url("./asset.png")', 'url(../asset.png)', 'url(asset.png)',
  'url("/src/asset.png")', 'url("~assets/asset.png")',
  'image-set("./asset.png" 1x, "./large.png" 2x)',
]) {
  const input = `<template><div :class="$style.root" /></template>
<style module lang="less">.root { background: ${value}; }</style>`
  const result = transformVueSfcLess(input, 'Card.vue')
  assert.equal(result.changed, false)
  assert.equal(result.code, input)
  assert.ok(result.diagnostics.some(item => item.message.includes('asset URL')))
  checks++
}
for (const value of ['url("https://example.com/asset.png")', 'url("data:image/png;base64,AAAA")', 'url("#mask")']) {
  const result = transformLessToCreateStyles(`.root { background: ${value}; }`)
  assert.deepEqual(result.diagnostics, [])
  assert.ok(result.styles.includes(JSON.stringify(value)))
  checks++
}
const scoped = `<template><div :class="$style.root"><Child /></div></template>
<style module lang="less">.other { color: blue; }</style>
<style scoped module lang="less">.root { button { color: red; } }</style>`
const scopedResult = transformVueSfcLess(scoped, 'Card.vue')
assert.equal(scopedResult.changed, false)
assert.equal(scopedResult.code, scoped)
assert.ok(scopedResult.diagnostics.some(item => item.message.includes('scoped')))
checks++
const safe = transformVueSfcLess(`<template><div :class="$style.root" /></template>
<style module lang="less">.root { color: red; &:hover { color: blue; } }</style>`)
assert.equal(safe.changed, true)
assert.deepEqual(safe.diagnostics, [])
assert.ok(safe.code.includes(':class="styles.root"'))
checks++
console.log(`Tooling PASS: ${checks} consumer checks, built exports, safe conversions and unchanged unsafe inputs.`)
console.log(`Runtime: ${fileURLToPath(import.meta.resolve('antdv-style'))}`)
console.log(`Plugin: ${fileURLToPath(import.meta.resolve('vite-plugin-antdv-style'))}`)
console.log(`Codemod: ${fileURLToPath(import.meta.resolve('@antdv-next/less2cssinjs'))}`)
