<script setup lang="ts">
import { defineComponent, h, nextTick, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { Button, ConfigProvider } from 'antdv-next'
import {
  createCacheManager, createInstance, createStyles, StyleProvider, ThemeProvider,
  useResponsive, useThemeMode, type Appearance, type ThemeMode,
} from 'antdv-style'
import MacSelectDemo from '../../antdv-style/docs/.vitepress/theme/components/MacSelectDemo.vue'
import ClayDemo from '../../antdv-style/docs/.vitepress/theme/components/ClayDemo.vue'
import StyleEngineDemo from '../../antdv-style/docs/.vitepress/theme/components/StyleEngineDemo.vue'
import CustomThemeDemo from '../../antdv-style/docs/.vitepress/theme/components/CustomThemeDemo.vue'
import BenchmarkDemo from '../../antdv-style/docs/.vitepress/theme/components/BenchmarkDemo.vue'

// A trailing comma exercises the built Vite plugin on a real Vue SFC.
const useProbeStyles = createStyles(({ css, isDarkMode }) => ({
  box: css({ padding: 16, color: isDarkMode ? '#ffffff' : '#141414', backgroundColor: isDarkMode ? '#141414' : '#ffffff' }),
}),)
const mode = ref<ThemeMode>('light')
const appearance = ref<Appearance>('light')
const acceptRequests = ref(true)
const modeEvents = ref(0)
const appearanceEvents = ref(0)
function requestMode(value: ThemeMode) {
  modeEvents.value++
  if (acceptRequests.value) mode.value = value
}
function requestAppearance(value: Appearance) {
  appearanceEvents.value++
  if (acceptRequests.value) appearance.value = value
}
const ModeProbe = defineComponent({
  props: { kind: { type: String, required: true } },
  setup(props) {
    const s = useProbeStyles()
    const ctx = useThemeMode()
    return () => h('div', { class: s.styles.box, 'data-testid': `${props.kind}-box` }, [
      h('output', { 'data-testid': `${props.kind}-state` }, ctx.appearance.value),
      h('output', { 'data-testid': `${props.kind}-mode` }, ctx.themeMode.value),
      h('button', {
        'data-testid': `${props.kind}-dark`,
        onClick: () => props.kind === 'mode' ? ctx.setThemeMode('dark') : ctx.setAppearance('dark'),
      }, 'Dark'),
      h('button', { 'data-testid': `${props.kind}-auto`, onClick: () => ctx.setThemeMode('auto') }, 'Auto'),
    ])
  },
})
const customMD = ref(900)
const BreakpointProbe = defineComponent({
  props: { name: { type: String, required: true } },
  setup(props) {
    const state = useResponsive()
    return () => h('output', { 'data-testid': `${props.name}-breakpoints` }, JSON.stringify(state))
  },
})
const shadowHost = shallowRef<HTMLDivElement | null>(null)
const shadowRoot = shallowRef<ShadowRoot | null>(null)
onMounted(() => { shadowRoot.value = shadowHost.value!.attachShadow({ mode: 'open' }) })
const useShadowStyles = createStyles({ box: { color: 'rgb(120, 30, 160)', padding: 12 } })
const ShadowProbe = defineComponent({
  setup() {
    const s = useShadowStyles()
    return () => h('div', { class: s.styles.box, 'data-testid': 'shadow-box' }, [
      'Shadow styles',
      h(Button, { type: 'primary', 'data-testid': 'shadow-button' }, () => 'Action'),
    ])
  },
})
const resetInstance = createInstance({ key: 'reset-proof' })
const resetManager = createCacheManager(resetInstance.styleManager)
const useResetStyles = resetInstance.createStyles({ box: { color: 'plum', border: '3px solid teal' } })
const resetVisible = ref(true)
const resetCount = ref(0)
const ResetProbe = defineComponent({
  setup() {
    const s = useResetStyles()
    return () => h('div', { class: s.styles.box, 'data-testid': 'reset-box' }, 'Reset styles')
  },
})
async function resetAndRemount() {
  resetVisible.value = false
  await nextTick()
  resetManager.reset()
  resetVisible.value = true
  resetCount.value++
}
onUnmounted(() => resetInstance.dispose())

</script>

<template>
  <ConfigProvider>
    <ThemeProvider>
      <main class="regression-page">
        <h1>antdv-style regressions</h1>
        <section>
          <h2>Controlled theme</h2>
          <label><input v-model="acceptRequests" type="checkbox" data-testid="accept-requests">Accept requests</label>
          <output data-testid="mode-events">{{ modeEvents }}</output>
          <output data-testid="appearance-events">{{ appearanceEvents }}</output>
          <ThemeProvider :theme-mode="mode" @theme-mode-change="requestMode"><ModeProbe kind="mode" /></ThemeProvider>
          <ThemeProvider :appearance="appearance" @appearance-change="requestAppearance"><ModeProbe kind="appearance" /></ThemeProvider>
        </section>
        <section>
          <h2>Responsive scopes</h2>
          <button data-testid="change-breakpoint" @click="customMD = 1100">MD 1100</button>
          <BreakpointProbe name="default" />
          <ConfigProvider :theme="{ token: { screenMD: customMD } }"><BreakpointProbe name="custom" /></ConfigProvider>
          <ThemeProvider :theme="{ token: { screenMD: 1100 } }"><BreakpointProbe name="theme" /></ThemeProvider>
        </section>
        <section>
          <h2>ShadowRoot</h2>
          <div ref="shadowHost" data-testid="shadow-host" />
          <Teleport v-if="shadowRoot" :to="shadowRoot">
            <StyleProvider cache-key="shadow-proof" :container="shadowRoot">
              <ThemeProvider prefix-cls="shadow-demo"><ShadowProbe /></ThemeProvider>
            </StyleProvider>
          </Teleport>
        </section>
        <section>
          <h2>Cache reset</h2>
          <button data-testid="reset" @click="resetAndRemount">Reset and remount</button>
          <output data-testid="reset-count">{{ resetCount }}</output>
          <resetInstance.ThemeProvider v-if="resetVisible"><ResetProbe /></resetInstance.ThemeProvider>
        </section>
        <section>
          <h2>Engine container</h2>
          <StyleEngineDemo />
        </section>
        <section><h2>Custom theme</h2><CustomThemeDemo /></section>
        <section><h2>Benchmark</h2><BenchmarkDemo /></section>
        <section><h2>MacSelect</h2><MacSelectDemo /></section>
        <section><h2>Clay</h2><ClayDemo /></section>
      </main>
    </ThemeProvider>
  </ConfigProvider>
</template>

<style scoped>
.regression-page { max-width: 960px; margin: auto; padding: 24px; color: #202124; }
section { border-top: 1px solid #dadce0; padding-block: 20px; }
h1 { font-size: 24px; }
h2 { font-size: 18px; }
output { display: block; overflow-wrap: anywhere; }
button { margin: 8px; padding: 6px 12px; }
</style>
