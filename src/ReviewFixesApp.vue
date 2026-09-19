<script setup lang="ts">
import { defineComponent, h, onUnmounted, ref } from 'vue'
import { Button, ConfigProvider } from 'antdv-next'
import {
  createInstance, createStaticStyles, createStaticStylesFactory, createStyles,
  css, cx, ThemeProvider, useAntdTheme,
  type CreateInstanceResult,
} from 'antdv-style'
import AssertionProbe from './review-fixes/AssertionProbe.vue'
import PropStylesProbe from './review-fixes/PropStylesProbe.vue'

const blue = css({ color: 'blue' })
const staticRed = createStaticStyles({ root: { color: 'red' } })
const factoryRed = createStaticStylesFactory().createStaticStyles({ root: { color: 'red' } })

function variableProbe(name: string, instance?: CreateInstanceResult) {
  const useStyles = (instance?.createStyles ?? createStyles)(({ cssVar }) => ({
    root: { color: cssVar.colorPrimary },
  }))
  return defineComponent({
    setup() {
      const state = useStyles()
      const theme = (instance?.useAntdTheme ?? useAntdTheme)()
      return () => h(Button, { type: 'primary', 'data-testid': `${name}-button` }, () => [
        h('span', {
          class: state.styles.root,
          'data-testid': `${name}-variable`,
          'data-reference': theme.value.cssVar.colorPrimary,
        }, name),
      ])
    },
  })
}

const PrefixProbe = variableProbe('prefix')
const ExplicitProbe = variableProbe('explicit')
const InheritedProbe = variableProbe('inherited')
const NestedProbe = variableProbe('nested')
const DynamicProbe = variableProbe('dynamic')
const OptOutProbe = variableProbe('optout')
const HashOverrideProbe = variableProbe('hash-override')
const isolated = createInstance({ key: 'review-instance', cssVarPrefix: 'instance-vars' })
const InstanceProbe = variableProbe('instance', isolated)
onUnmounted(() => isolated.dispose())
const dynamicPrefix = ref('first')
const dynamicColor = ref('#e12345')
const tone = ref<'brand' | 'neutral'>('neutral')
const docColor = ref('#e12345')
const showGlobals = ref(true)
const query = new URLSearchParams(location.search)
const upstreamOnly = query.has('upstream-only')
const purePrefix = ref('pure-first')
const pureHashed = query.has('hashed')

const GlobalOrderProbe = defineComponent({
  props: { placement: { type: String, required: true } },
  setup(props) {
    const name = props.placement
    const container = document.createElement('section')
    container.dataset.globalContainer = name
    const insertionPoint = document.createElement('meta')
    container.append(insertionPoint)
    document.head.append(container)
    const instance = createInstance({
      key: `review-global-${name}`,
      container,
      speedy: name === 'speedy',
      nonce: 'review-proof',
      insertionPoint: name === 'insertion' ? insertionPoint : undefined,
    })
    if (name === 'prepend') instance.styleManager.sheet.prepend = true
    const color = ref<string | undefined>('red')
    const selector = `[data-testid="global-${name}-target"]`
    const useFirst = instance.createGlobalStyle(() => color.value
      ? { [selector]: { color: color.value } }
      : undefined)
    const useSecond = instance.createGlobalStyle(() => ({ [selector]: { color: 'blue' } }))
    const Content = defineComponent({
      setup() {
        useFirst()
        useSecond()
        return () => h('div', [
          h('span', { 'data-testid': `global-${name}-target` }, name),
          h('button', { 'data-testid': `global-${name}-update`, onClick: () => { color.value = 'green' } }, 'Update'),
          h('button', { 'data-testid': `global-${name}-clear`, onClick: () => { color.value = undefined } }, 'Clear'),
          h('button', { 'data-testid': `global-${name}-restore`, onClick: () => { color.value = 'purple' } }, 'Restore'),
        ])
      },
    })
    onUnmounted(() => {
      instance.dispose()
      // Keep the container to let Playwright inspect cleanup after child unmount.
    })
    return () => h(instance.ThemeProvider, null, { default: () => h(Content) })
  },
})
</script>

<template>
  <main v-if="upstreamOnly" class="review-page">
    <h1>ConfigProvider Control</h1>
    <ConfigProvider prefix-cls="pure-shared" :theme="{ hashed: pureHashed, cssVar: { prefix: purePrefix }, token: { colorPrimary: '#e12345' } }">
      <Button type="primary" data-testid="pure-first">First provider</Button>
    </ConfigProvider>
    <ConfigProvider v-if="!query.has('single-provider')" prefix-cls="pure-shared" :theme="{ hashed: pureHashed, cssVar: { prefix: 'pure-second' }, token: { colorPrimary: '#e12345' } }">
      <Button type="primary" data-testid="pure-second">Second provider</Button>
    </ConfigProvider>
    <button data-testid="pure-change-prefix" @click="purePrefix = 'pure-updated'">Change CSS variable prefix</button>
  </main>
  <main v-else class="review-page">
    <h1>Review Regression Tests</h1>
    <section>
      <h2>TypeScript Compilation</h2>
      <ThemeProvider><AssertionProbe /></ThemeProvider>
    </section>
    <section>
      <h2>Static Style Merging</h2>
      <p data-testid="static-red-blue" :class="cx(staticRed.root, blue)">Blue wins</p>
      <p data-testid="static-blue-red" :class="cx(blue, staticRed.root)">Red wins</p>
      <p data-testid="factory-red-blue" :class="cx(factoryRed.root, blue)">Factory blue wins</p>
    </section>
    <section>
      <h2>CSS Variable Prefixes</h2>
      <ThemeProvider prefix-cls="acme" :theme="{ token: { colorPrimary: '#e12345' } }">
        <PrefixProbe />
      </ThemeProvider>
      <ThemeProvider prefix-cls="explicit" :theme="{ cssVar: { prefix: 'brand' }, token: { colorPrimary: '#e12345' } }">
        <ExplicitProbe />
      </ThemeProvider>
      <ConfigProvider :theme="{ cssVar: { prefix: 'host' } }">
        <ThemeProvider :theme="{ token: { colorPrimary: '#e12345' } }"><InheritedProbe /></ThemeProvider>
      </ConfigProvider>
      <ThemeProvider :theme="{ cssVar: { prefix: 'outer' }, token: { colorPrimary: '#e12345' } }">
        <ThemeProvider><NestedProbe /></ThemeProvider>
      </ThemeProvider>
      <isolated.ThemeProvider :theme="{ token: { colorPrimary: '#e12345' } }">
        <InstanceProbe />
      </isolated.ThemeProvider>
      <ThemeProvider :theme="{ cssVar: { prefix: dynamicPrefix }, token: { colorPrimary: dynamicColor } }">
        <DynamicProbe />
      </ThemeProvider>
      <ThemeProvider prefix-cls="optout" :theme="{ hashed: false, cssVar: { prefix: 'optout-vars' }, token: { colorPrimary: '#e12345' } }">
        <OptOutProbe />
      </ThemeProvider>
      <ConfigProvider :theme="{ hashed: false }">
        <ThemeProvider :theme="{ hashed: true, cssVar: { prefix: 'hash-override' }, token: { colorPrimary: '#e12345' } }">
          <HashOverrideProbe />
        </ThemeProvider>
      </ConfigProvider>
      <button data-testid="change-variable-prefix" @click="dynamicPrefix = dynamicPrefix === 'first' ? 'second' : 'third'">Change prefix</button>
      <button data-testid="change-variable-token" @click="dynamicColor = '#00796b'">Change token</button>
    </section>
    <section>
      <h2>Global Style Ordering</h2>
      <template v-if="showGlobals">
        <GlobalOrderProbe v-for="placement in ['append', 'prepend', 'insertion', 'speedy']" :key="placement" :placement="placement" />
      </template>
      <button data-testid="unmount-globals" @click="showGlobals = false">Unmount globals</button>
    </section>
    <section>
      <h2>Reactive Documentation Pattern</h2>
      <ThemeProvider :theme="{ token: { colorPrimary: docColor, colorText: '#111111' } }">
        <PropStylesProbe :tone="tone" />
      </ThemeProvider>
      <button data-testid="change-doc-prop" @click="tone = 'brand'">Brand tone</button>
      <button data-testid="change-doc-token" @click="docColor = '#00796b'">Change brand</button>
    </section>
  </main>
</template>

<style scoped>
.review-page { max-width: 960px; margin: auto; padding: 24px; color: #202124; }
section { border-top: 1px solid #dadce0; padding-block: 20px; }
h1 { font-size: 24px; }
h2 { font-size: 18px; }
button { margin: 8px; padding: 6px 12px; }
p { margin-block: 8px; overflow-wrap: anywhere; }
</style>
