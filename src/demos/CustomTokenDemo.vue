<script setup lang="ts">
/**
 * Demo 4: customToken — 扩展自定义 token
 */
import { defineComponent, h } from 'vue'
import { ThemeProvider, createStyles, useTheme } from 'antdv-style'

const useStyles = createStyles(({ token, css }) => ({
  card: css`
    padding: ${token.paddingLG}px;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.cardBg};
    border: 2px solid ${token.brandColor};
  `,
  brand: css`
    color: ${token.brandColor};
    font-size: ${token.fontSizeLG}px;
    font-weight: 600;
    margin-bottom: 8px;
  `,
  info: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
    line-height: 1.8;
  `,
}))

const TokenConsumer = defineComponent({
  setup() {
    const s = useStyles()
    const themeVal = useTheme()
    return () => h('div', { class: s.styles.card }, [
      h('div', { class: s.styles.brand }, 'Custom Token Demo'),
      h('div', { class: s.styles.info }, [
        h('div', {}, `brandColor: ${themeVal.value.brandColor}`),
        h('div', {}, `cardBg: ${themeVal.value.cardBg}`),
        h('div', {}, `colorPrimary (auto from antdv-next): ${themeVal.value.colorPrimary}`),
      ]),
    ])
  },
})
</script>

<template>
  <!-- No :theme needed — auto-detects from antdv-next -->
  <ThemeProvider
    :custom-token="{
      brandColor: '#7c3aed',
      cardBg: '#faf5ff',
    }"
  >
    <TokenConsumer />
  </ThemeProvider>
</template>
