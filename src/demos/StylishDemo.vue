<script setup lang="ts">
/**
 * Demo 6: createStylish — 可复用样式预设
 */
import { defineComponent, h } from 'vue'
import { ThemeProvider, createStylish, createStyles } from 'antdv-style'

const useStylish = createStylish(({ css }) => ({
  defaultCard: css`
    padding: 16px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    border: 1px solid #f0f0f0;
  `,
  primaryCard: css`
    padding: 16px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  `,
  tag: css`
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    background: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
  `,
}))

const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  `,
}))

const StylishConsumer = defineComponent({
  setup() {
    const stylish = useStylish()  // ComputedRef — need .value
    const s = useStyles()
    return () => h('div', { class: s.styles.grid }, [
      h('div', { class: stylish.value.defaultCard }, [
        h('span', { class: stylish.value.tag }, 'default'),
        h('div', { style: 'margin-top: 8px;' }, '默认卡片预设样式'),
      ]),
      h('div', { class: stylish.value.primaryCard }, [
        h('span', { style: 'opacity: 0.8; font-size: 12px;' }, 'primary'),
        h('div', { style: 'margin-top: 8px;' }, '主题渐变卡片'),
      ]),
    ])
  },
})
</script>

<template>
  <ThemeProvider theme-mode="light">
    <StylishConsumer />
  </ThemeProvider>
</template>
