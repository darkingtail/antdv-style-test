<script setup lang="ts">
/**
 * Demo 3: ThemeProvider + 明暗切换
 */
import { ref, defineComponent, h } from 'vue'
import { theme } from 'antdv-next'
import { ThemeProvider, createStyles, useThemeMode } from 'antdv-style'

const themeMode = ref<'light' | 'dark' | 'auto'>('light')

const lightToken = theme.getDesignToken()
const darkToken = theme.getDesignToken({ algorithm: theme.darkAlgorithm })

const useStyles = createStyles(({ token, css }) => ({
  panel: css`
    padding: ${token.paddingLG}px;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    color: ${token.colorText};
    border: 1px solid ${token.colorBorderSecondary};
    transition: all 0.3s;
  `,
  badge: css`
    display: inline-block;
    padding: ${token.paddingXS}px ${token.paddingSM}px;
    border-radius: ${token.borderRadiusSM}px;
    font-size: ${token.fontSizeSM}px;
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
    margin-bottom: ${token.marginSM}px;
  `,
  info: css`
    font-size: ${token.fontSize}px;
    color: ${token.colorTextSecondary};
    line-height: 2;
  `,
}))

const ThemeConsumer = defineComponent({
  setup() {
    const s = useStyles()
    const { appearance, isDarkMode } = useThemeMode()
    return () => h('div', { class: s.styles.panel }, [
      h('div', { class: s.styles.badge }, `${appearance.value} mode`),
      h('div', { class: s.styles.info }, [
        h('div', {}, `appearance: ${appearance.value}`),
        h('div', {}, `isDarkMode: ${isDarkMode.value}`),
      ]),
    ])
  },
})
</script>

<template>
  <div>
    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <a-button
        v-for="mode in ['light', 'dark', 'auto']"
        :key="mode"
        :type="themeMode === mode ? 'primary' : 'default'"
        @click="themeMode = mode as any"
      >
        {{ mode }}
      </a-button>
    </div>

    <ThemeProvider
      :theme-mode="themeMode"
      :theme="(appearance: string) => ({
        token: appearance === 'dark' ? darkToken : lightToken,
      })"
    >
      <ThemeConsumer />
    </ThemeProvider>
  </div>
</template>
