<script setup lang="ts">
import { createStyles } from 'antdv-style'
import { useAssertionStyles } from './typescriptStyles'

// @ts-expect-error TS1294: Deliberate parser fixture in an erasableSyntaxOnly project.
const opacity = <number>0.75
const useSfcAssertionStyles = createStyles(() => ({ root: { opacity } }))
const fromModule = useAssertionStyles()
const fromSfc = useSfcAssertionStyles()
</script>

<template>
  <div data-testid="ts-assertion" :class="fromModule.styles.root">TS</div>
  <div data-testid="sfc-assertion" :class="fromSfc.styles.root">SFC</div>
</template>
