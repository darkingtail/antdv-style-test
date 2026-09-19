import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createInstance, extractStaticStyle, px2remTransformer } from 'antdv-style'

export async function inspectRuntime() {
  const instance = createInstance({ key: 'audit-runtime' })
  const color = ref('rgb(11, 22, 33)')
  let first = ''
  let second = ''
  let factoryCalls = 0
  const useGetterStyles = instance.createStyles<{ color: string }>((_utils, props) => {
    factoryCalls++
    return { root: { color: props.color } }
  })
  const Probe = defineComponent({
    setup() {
      const result = useGetterStyles(() => ({ color: color.value }))
      first = result.styles.root
      color.value = 'rgb(44, 55, 66)'
      second = result.styles.root
      return () => h('div', { class: result.styles.root }, 'closure')
    },
  })
  try {
    const html = await renderToString(createSSRApp({
      render: () => h(instance.ThemeProvider, null, { default: () => h(Probe) }),
    }))
    await nextTick()
    const css = extractStaticStyle(instance.styleManager, { html, includeAntdv: false }).css
    const payloads = ['style', 'StYlE'].map(tag => {
      const content = `</${tag}><script>globalThis.__antdvAuditExecuted = true</script>`
      const className = instance.css({ content: JSON.stringify(content), color: 'rgb(1, 2, 3)' })
      const extracted = extractStaticStyle(instance.styleManager, {
        html: `<div class="${className}"></div>`, includeAntdv: false,
      })
      return { ...extracted, content, className }
    })
    return {
      getter: { first, second, factoryCalls, css },
      payloads,
      px2rem: px2remTransformer()('background:url("/assets/icon-16px.png");content:"16px";padding:16px'),
    }
  } finally {
    instance.dispose()
  }
}
