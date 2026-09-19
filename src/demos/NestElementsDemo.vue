<script setup lang="ts">
/**
 * 最佳实践：父子联动的样式书写
 */
import { createStyles } from 'antdv-style'

const useStyles = createStyles(({ css }) => {
  const child = css`
    background: #ff4d4f;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    flex-shrink: 0;
    transition: background 0.3s;
  `

  // 用 css() 函数调用 + 普通模板字符串，确保 child 作为选择器字面量插入
  const parent = css(`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid #d9d9d9;
    cursor: pointer;

    &:hover .${child} {
      background: #1677ff;
    }
  `)

  return { parent, child }
})

const s = useStyles()
</script>

<template>
  <div :class="s.styles.parent" data-testid="nested-parent">
    <div :class="s.styles.child" data-testid="nested-child" />
    <div>
      <div style="font-weight: 600; margin-bottom: 4px;">hover 试试</div>
      <div style="font-size: 13px; color: #999;">父容器 hover 时，红色方块变蓝</div>
    </div>
  </div>
</template>
