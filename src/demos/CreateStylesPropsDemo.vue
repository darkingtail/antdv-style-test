<script setup lang="ts">
/**
 * Demo 2: createStyles + Props — 动态样式
 */
import { ref } from 'vue'
import { createStyles } from 'antdv-style'

interface StyleProps {
  isActive: boolean
  size: 'small' | 'medium' | 'large'
}

const useStyles = createStyles(({ token, css }, props: StyleProps) => {
  const sizeMap = {
    small: `${token.paddingXS}px ${token.paddingSM}px`,
    medium: `${token.padding}px ${token.paddingLG}px`,
    large: `${token.paddingLG}px ${token.paddingXL}px`,
  }

  return {
    button: css`
      padding: ${sizeMap[props.size]};
      background: ${props.isActive ? token.colorPrimary : token.colorBgContainer};
      color: ${props.isActive ? token.colorTextLightSolid : token.colorText};
      border: 1px solid ${props.isActive ? 'transparent' : token.colorBorder};
      border-radius: ${token.borderRadius}px;
      cursor: pointer;
      transition: all ${token.motionDurationMid};
      font-size: ${token.fontSize}px;
      margin-right: 8px;

      &:hover {
        opacity: 0.85;
        border-color: ${token.colorPrimaryBorderHover};
      }
    `,
  }
})

const isActive = ref(false)
const size = ref<'small' | 'medium' | 'large'>('medium')

// Don't destructure styles — keep the reactive proxy intact
const result = useStyles(() => ({
  isActive: isActive.value,
  size: size.value,
}))

function toggle() {
  isActive.value = !isActive.value
}

function changeSize() {
  const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large']
  const idx = sizes.indexOf(size.value)
  size.value = sizes[(idx + 1) % sizes.length]
}
</script>

<template>
  <div style="display: flex; gap: 8px; align-items: center;">
    <button :class="result.styles.button" @click="toggle">
      {{ isActive ? 'Active' : 'Inactive' }}
    </button>
    <button :class="result.styles.button" @click="changeSize">
      Size: {{ size }}
    </button>
    <span style="color: #999; font-size: 13px;">点击切换状态和尺寸</span>
  </div>
</template>
