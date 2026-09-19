<script setup lang="ts">
/**
 * Demo 9: createInstance — 多实例隔离
 */
import { defineComponent, h } from 'vue'
import { createInstance } from 'antdv-style'

const appA = createInstance({ key: 'app-a' })
const appB = createInstance({ key: 'app-b' })

const useStylesA = appA.createStyles(({ css }) => ({
  box: css`
    padding: 16px;
    background: #e6f7ff;
    border: 2px solid #1890ff;
    border-radius: 8px;
    color: #1890ff;
    font-weight: 600;
  `,
}))

const useStylesB = appB.createStyles(({ css }) => ({
  box: css`
    padding: 16px;
    background: #fff2e8;
    border: 2px solid #fa8c16;
    border-radius: 8px;
    color: #fa8c16;
    font-weight: 600;
  `,
}))

const ConsumerA = defineComponent({
  setup() {
    const s = useStylesA()
    return () => h('div', { class: s.styles.box }, 'Instance A (app-a) — 蓝色主题')
  },
})

const ConsumerB = defineComponent({
  setup() {
    const s = useStylesB()
    return () => h('div', { class: s.styles.box }, 'Instance B (app-b) — 橙色主题')
  },
})

const ProviderA = appA.ThemeProvider
const ProviderB = appB.ThemeProvider
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <ProviderA theme-mode="light">
      <ConsumerA />
    </ProviderA>
    <ProviderB theme-mode="light">
      <ConsumerB />
    </ProviderB>
  </div>
</template>
