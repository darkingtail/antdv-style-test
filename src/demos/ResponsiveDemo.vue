<script setup lang="ts">
/**
 * Demo 8: useResponsive — 响应式断点检测
 * 演示实时断点状态
 */
import { useResponsive } from 'antdv-style'

const responsive = useResponsive()
</script>

<template>
  <div>
    <div style="font-size: 14px; line-height: 2.2;">
      <div v-for="(val, key) in responsive" :key="key" style="display: flex; align-items: center; gap: 8px;">
        <span
          :style="{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: val ? '#52c41a' : '#d9d9d9',
          }"
        ></span>
        <code>{{ key }}</code>: <strong>{{ val }}</strong>
      </div>
    </div>
    <div style="margin-top: 12px; font-size: 12px; color: #999;">
      缩放浏览器窗口查看断点变化（相同断点配置共享监听器，不同主题配置相互隔离）
    </div>
  </div>
</template>
