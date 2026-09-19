<script setup lang="ts">
/**
 * Demo 1: createStyles — 核心样式 API
 * 演示 css 模板字符串、CSS 对象、cx 合并、token 访问
 */
import { createStyles } from 'antdv-style'

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    background-color: ${token.colorBgLayout};
    padding: ${token.paddingLG}px;
    border-radius: ${token.borderRadiusLG}px;
  `,
  card: {
    backgroundColor: token.colorBgContainer,
    padding: `${token.padding}px`,
    borderRadius: `${token.borderRadius}px`,
    boxShadow: token.boxShadowTertiary,
    marginBottom: '12px',
  },
  title: css`
    color: ${token.colorPrimary};
    font-size: ${token.fontSizeLG}px;
    font-weight: 600;
    margin-bottom: 8px;
  `,
  description: {
    color: token.colorTextSecondary,
    fontSize: `${token.fontSize}px`,
  },
}))

// Don't destructure `styles` — access through reactive proxy to keep reactivity
const s = useStyles()
</script>

<template>
  <div :class="s.styles.container">
    <div :class="s.styles.card">
      <div :class="s.styles.title">createStyles — CSS 模板字符串</div>
      <div :class="s.styles.description">
        使用 css`` 标签模板，支持 antdv-next token 插值
      </div>
    </div>
    <div :class="s.styles.card">
      <div :class="s.styles.title">createStyles — CSS 对象</div>
      <div :class="s.styles.description">使用 JS 对象语法，camelCase 属性名</div>
    </div>
    <div :class="s.cx(s.styles.card, s.styles.title)">
      <div>cx 合并多个样式类</div>
    </div>
  </div>
</template>
