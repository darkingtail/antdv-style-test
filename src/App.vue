<script setup lang="ts">
import { ConfigProvider } from 'antdv-next'
import { ThemeProvider } from 'antdv-style'
import CreateStylesDemo from './demos/CreateStylesDemo.vue'
import CreateStylesPropsDemo from './demos/CreateStylesPropsDemo.vue'
import ThemeSwitchDemo from './demos/ThemeSwitchDemo.vue'
import CustomTokenDemo from './demos/CustomTokenDemo.vue'
import GlobalStyleDemo from './demos/GlobalStyleDemo.vue'
import StylishDemo from './demos/StylishDemo.vue'
import StaticStylesDemo from './demos/StaticStylesDemo.vue'
import ResponsiveDemo from './demos/ResponsiveDemo.vue'
import MultiInstanceDemo from './demos/MultiInstanceDemo.vue'
import UseAntdThemeDemo from './demos/UseAntdThemeDemo.vue'
import Px2RemDemo from './demos/Px2RemDemo.vue'
import CSSVarDemo from './demos/CSSVarDemo.vue'
import NestElementsDemo from './demos/NestElementsDemo.vue'

const demos = [
  { title: '1. createStyles — 核心样式 API', comp: CreateStylesDemo },
  { title: '2. createStyles + Props — 动态样式', comp: CreateStylesPropsDemo },
  { title: '3. ThemeProvider — 明暗切换', comp: ThemeSwitchDemo },
  { title: '4. customToken + theme 函数', comp: CustomTokenDemo },
  { title: '5. createGlobalStyle — 全局样式', comp: GlobalStyleDemo },
  { title: '6. createStylish — 可复用预设', comp: StylishDemo },
  { title: '7. createStaticStyles + cssVar', comp: StaticStylesDemo },
  { title: '8. useResponsive — 断点检测', comp: ResponsiveDemo },
  { title: '9. createInstance — 多实例隔离', comp: MultiInstanceDemo },
  { title: '10. useAntdTheme 系列 Composables', comp: UseAntdThemeDemo },
  { title: '11. px2remTransformer', comp: Px2RemDemo },
  { title: '12. tokenToCSSVar — CSS 变量生成', comp: CSSVarDemo },
]
</script>

<template>
  <ConfigProvider>
    <ThemeProvider>
      <div style="max-width: 960px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 28px; margin-bottom: 8px;">antdv-style Demo</h1>
        <p style="color: #999; margin-bottom: 32px;">
          antdv-style 全量功能验证（自动接入 antdv-next token）
        </p>

        <div v-for="demo in demos" :key="demo.title" style="margin-bottom: 32px;">
          <h2 style="font-size: 18px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;">
            {{ demo.title }}
          </h2>
          <component :is="demo.comp" />
        </div>

        <h1 style="font-size: 24px; margin: 48px 0 24px; padding-top: 24px; border-top: 2px solid #f0f0f0;">
          Best Practices
        </h1>

        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 18px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;">
            父子联动的样式书写
          </h2>
          <NestElementsDemo />
        </div>
      </div>
    </ThemeProvider>
  </ConfigProvider>
</template>
