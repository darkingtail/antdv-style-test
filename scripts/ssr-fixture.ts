import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Button, version as antdvNextVersion } from 'antdv-next'
import { createCache } from '@antdv-next/cssinjs'
import { createCacheManager, createInstance, extractStaticStyle, useResponsive } from 'antdv-style'

async function renderRequest(key: string, color: string, otherKey: string) {
  const style = createInstance({ key })
  const antdCache = createCache()
  const useStyles = style.createStyles({ root: { color } })
  let screens = {}
  const App = defineComponent({
    setup() {
      const s = useStyles()
      screens = { ...useResponsive() }
      return () => h('div', { class: s.styles.root }, [h(Button, null, () => key)])
    },
  })
  const render = () => renderToString(createSSRApp({
    render: () => h(style.StyleProvider, { antdCache }, {
      default: () => h(style.ThemeProvider, null, { default: () => h(App) }),
    }),
  }))
  try {
    style.css({ color: 'tomato' })
    const html = await render()
    const result = extractStaticStyle(style.styleManager, { html, antdCache })
    createCacheManager(style.styleManager).reset()
    const resetHTML = await render()
    const resetCSS = extractStaticStyle(style.styleManager, { html: resetHTML, antdCache }).css
    return { ...result, html, key, color, otherKey, resetCSS, screens, antdvNextVersion }
  } finally {
    style.dispose()
  }
}

export function verifySSR() {
  return Promise.all([
    renderRequest('request-one', 'plum', 'request-two'),
    renderRequest('request-two', 'teal', 'request-one'),
  ])
}
