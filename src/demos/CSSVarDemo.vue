<script setup lang="ts">
/**
 * Demo 12: tokenToCSSVar — Token 转 CSS 变量
 * 使用真实 antdv-next token
 */
import { theme } from 'antdv-next'
import { tokenToCSSVar } from 'antdv-style'

const antdToken = theme.getDesignToken()

// Pick a subset to display
const sampleToken = {
  colorPrimary: antdToken.colorPrimary,
  colorSuccess: antdToken.colorSuccess,
  colorWarning: antdToken.colorWarning,
  colorError: antdToken.colorError,
  borderRadius: antdToken.borderRadius,
  fontSizeLG: antdToken.fontSizeLG,
  paddingLG: antdToken.paddingLG,
}

const cssVarOutput = tokenToCSSVar(sampleToken)

const totalTokenCount = Object.keys(antdToken).length
</script>

<template>
  <div>
    <div style="font-weight: 600; margin-bottom: 8px;">
      Token Object → CSS Variables ({{ totalTokenCount }} tokens available)
    </div>
    <pre style="background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto; white-space: pre-wrap;">{{ cssVarOutput }}</pre>
    <div style="margin-top: 12px; font-size: 12px; color: #999;">
      camelCase 正确转换：fontSizeLG → font-size-lg
    </div>
  </div>
</template>
