<script setup lang="ts">
/**
 * Demo 11: px2remTransformer — CSS 后处理器
 * 演示 px 到 rem 的转换
 */
import { px2remTransformer } from 'antdv-style'

const transformer = px2remTransformer({ rootValue: 16, precision: 4 })

const inputCSS = `.box {
  font-size: 16px;
  padding: 24px 32px;
  margin-bottom: 8px;
  border-radius: 4px;
  width: 100%;
}`

const outputCSS = transformer(inputCSS)
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <div>
      <div style="font-weight: 600; margin-bottom: 8px;">Input (px)</div>
      <pre style="background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto;">{{ inputCSS }}</pre>
    </div>
    <div>
      <div style="font-weight: 600; margin-bottom: 8px;">Output (rem)</div>
      <pre style="background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto;">{{ outputCSS }}</pre>
    </div>
  </div>
</template>
