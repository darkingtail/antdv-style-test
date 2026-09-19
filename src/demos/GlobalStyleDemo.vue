<script setup lang="ts">
/**
 * Demo 5: createGlobalStyle — 全局样式注入
 */
import { ref, defineComponent, h } from 'vue'
import { theme } from 'antdv-next'
import { ThemeProvider, createGlobalStyle } from 'antdv-style'

const lightToken = theme.getDesignToken()
const darkToken = theme.getDesignToken({ algorithm: theme.darkAlgorithm })

const useGlobalStyle = createGlobalStyle(({ token }) => ({
  '.global-demo-target': {
    padding: `${token.paddingLG}px`,
    borderRadius: `${token.borderRadiusLG}px`,
    backgroundColor: token.colorBgContainer,
    color: token.colorText,
    border: `1px solid ${token.colorBorderSecondary}`,
    transition: 'all 0.3s',
  },
}))

const dark = ref(false)

const GlobalConsumer = defineComponent({
  setup() {
    useGlobalStyle()
    return () => h('div', { class: 'global-demo-target' }, [
      h('strong', {}, '这段样式来自 createGlobalStyle'),
      h('div', { style: 'font-size: 13px; color: #999; margin-top: 4px;' },
        '使用 .global-demo-target 选择器注入全局 CSS，token 响应式更新'),
    ])
  },
})
</script>

<template>
  <div>
    <a-switch v-model:checked="dark" checked-children="Dark" un-checked-children="Light" />
    <div style="margin-top: 12px;">
      <ThemeProvider
        :theme-mode="dark ? 'dark' : 'light'"
        :theme="(appearance: string) => ({
          token: appearance === 'dark' ? darkToken : lightToken,
        })"
      >
        <GlobalConsumer />
      </ThemeProvider>
    </div>
  </div>
</template>
