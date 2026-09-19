<script setup lang="ts">
import { toRefs } from 'vue'
import { createStyles } from 'antdv-style'

const props = withDefaults(defineProps<{ tone?: 'brand' | 'neutral' }>(), {
  tone: 'neutral',
})
const useStyles = createStyles<{ tone: 'brand' | 'neutral' }>(
  ({ css, token }, value) => ({
    root: css({ color: value.tone === 'brand' ? token.colorPrimary : token.colorText }),
  }),
)
const { styles } = toRefs(useStyles(() => ({ tone: props.tone })))
</script>

<template>
  <span data-testid="reactive-doc-example" :class="styles.root">Reactive styles</span>
</template>
