<script setup lang="ts">
/**
 * Demo 7: createStaticStyles — 静态样式 + CSS 变量
 * 演示模块级缓存和 cssVar 代理
 */
import { createStaticStyles, cssVar } from 'antdv-style'

const useStaticStyles = createStaticStyles(({ css, cssVar: cv, responsive }) => ({
  layout: css`
    display: flex;
    gap: 16px;
    padding: 16px;
    background: ${cv.colorBgLayout};
    border-radius: 8px;

    ${responsive.md} {
      flex-direction: column;
    }
  `,
  box: css`
    flex: 1;
    padding: 16px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #f0f0f0;
    font-size: 14px;
  `,
}))

const { styles } = useStaticStyles()

// Also show cssVar proxy usage
const varExamples = {
  colorPrimary: cssVar.colorPrimary,
  borderRadius: cssVar.borderRadius,
  fontSizeLG: cssVar.fontSizeLG,
}
</script>

<template>
  <div>
    <div :class="styles.layout">
      <div :class="styles.box">
        <strong>静态样式 Box 1</strong>
        <div style="color: #999; font-size: 12px; margin-top: 4px;">
          使用 createStaticStyles — 零运行时开销
        </div>
      </div>
      <div :class="styles.box">
        <strong>静态样式 Box 2</strong>
        <div style="color: #999; font-size: 12px; margin-top: 4px;">
          使用 responsive.md 响应式断点
        </div>
      </div>
    </div>
    <div style="margin-top: 12px; font-size: 13px; color: #666;">
      <div><strong>cssVar 代理示例：</strong></div>
      <div v-for="(val, key) in varExamples" :key="key">
        <code>cssVar.{{ key }}</code> → <code>{{ val }}</code>
      </div>
    </div>
  </div>
</template>
