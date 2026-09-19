<script setup lang="ts">
/**
 * Demo 10: useAntdTheme + useAntdToken + useTheme + useThemeMode
 */
import { defineComponent, h } from 'vue'
import {
  ThemeProvider,
  useTheme,
  useAntdToken,
  useAntdTheme,
  useAntdStylish,
  useThemeMode,
} from 'antdv-style'

const ThemeInfoConsumer = defineComponent({
  setup() {
    const themeVal = useTheme()
    const antdTokenVal = useAntdToken()
    const antdThemeVal = useAntdTheme()
    const stylishVal = useAntdStylish()
    const modeCtx = useThemeMode()

    return () => h('div', { style: 'font-size: 13px; line-height: 2;' }, [
      h('div', {}, [
        h('strong', {}, 'useTheme() '),
        '(full Theme — auto token + state + stylish):',
      ]),
      h('div', { style: 'padding-left: 16px;' }, [
        h('div', {}, `colorPrimary: ${themeVal.value.colorPrimary}`),
        h('div', {}, `brandColor: ${themeVal.value.brandColor}`),
        h('div', {}, `appearance: ${themeVal.value.appearance}`),
        h('div', {}, `isDarkMode: ${themeVal.value.isDarkMode}`),
        h('div', {}, `prefixCls: ${themeVal.value.prefixCls}`),
        h('div', {}, `iconPrefixCls: ${themeVal.value.iconPrefixCls}`),
      ]),

      h('div', { style: 'margin-top: 8px;' }, [
        h('strong', {}, 'useAntdToken() '),
        '(base token only, no customToken):',
      ]),
      h('div', { style: 'padding-left: 16px;' }, [
        h('div', {}, `colorPrimary: ${antdTokenVal.value.colorPrimary}`),
        h('div', {}, `brandColor: ${'brandColor' in antdTokenVal.value ? antdTokenVal.value.brandColor : 'undefined (not in base)'}`),
      ]),

      h('div', { style: 'margin-top: 8px;' }, [
        h('strong', {}, 'useAntdTheme() '),
        '(spread token + stylish):',
      ]),
      h('div', { style: 'padding-left: 16px;' }, [
        h('div', {}, `colorPrimary: ${antdThemeVal.value.colorPrimary}`),
        h('div', {}, `stylish: ${JSON.stringify(antdThemeVal.value.stylish)}`),
      ]),

      h('div', { style: 'margin-top: 8px;' }, [
        h('strong', {}, 'useThemeMode() '),
        '(with setters):',
      ]),
      h('div', { style: 'padding-left: 16px;' }, [
        h('div', {}, `themeMode: ${modeCtx.themeMode.value}`),
        h('div', {}, `appearance: ${modeCtx.appearance.value}`),
        h('div', {}, `browserPrefers: ${modeCtx.browserPrefers?.value ?? 'N/A'}`),
        h('div', {}, `setAppearance: ${typeof modeCtx.setAppearance}`),
        h('div', {}, `setThemeMode: ${typeof modeCtx.setThemeMode}`),
      ]),

      h('div', { style: 'margin-top: 8px;' }, [
        h('strong', {}, 'useAntdStylish(): '),
        `${Object.keys(stylishVal.value).length ? JSON.stringify(stylishVal.value) : '{} (no stylish defined)'}`,
      ]),
    ])
  },
})
</script>

<template>
  <!-- No :theme needed — auto-detects from antdv-next -->
  <ThemeProvider :custom-token="{ brandColor: '#eb2f96' }">
    <ThemeInfoConsumer />
  </ThemeProvider>
</template>
