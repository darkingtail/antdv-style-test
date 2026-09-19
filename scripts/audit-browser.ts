import { createApp, defineComponent, h, ref } from 'vue'
import { createInstance, ThemeProvider } from 'antdv-style'
import SetupBefore from '../audit-generated/SetupBefore.vue'
import SetupAfter from '../audit-generated/SetupAfter.vue'

const instance = createInstance({ key: 'audit-browser' })
const closureColor = ref('rgb(11, 22, 33)')
const getterColor = ref('rgb(11, 22, 33)')
const useClosure = instance.createStyles<{ color: string }>((_utils, props) => ({
  root: { color: props.color },
}))
const useGetter = instance.createStyles<{ color: string }>((_utils, props) => ({
  root: { color: props.color },
}))
const Closure = defineComponent({
  setup() {
    const state = useClosure(() => ({ color: closureColor.value }))
    return () => h('div', { 'data-testid': 'closure', class: state.styles.root }, 'closure')
  },
})
const Getter = defineComponent({
  setup() {
    const state = useGetter(() => ({ color: getterColor.value }))
    return () => h('div', { 'data-testid': 'getter', class: state.styles.root }, 'getter')
  },
})

createApp({
  render() {
    return h('main', [
      h('h1', 'Current Library Audit'),
      h('button', {
        'data-testid': 'change-color',
        onClick() {
          closureColor.value = 'rgb(44, 55, 66)'
          getterColor.value = 'rgb(44, 55, 66)'
        },
      }, 'Change color'),
      h(instance.ThemeProvider, null, { default: () => [h(Closure), h(Getter)] }),
      h(ThemeProvider, null, {
        default: () => [
          h('section', { 'data-testid': 'before' }, [h(SetupBefore)]),
          h('section', { 'data-testid': 'after' }, [h(SetupAfter)]),
        ],
      }),
    ])
  },
}).mount('#audit-app')
