import { AppContext, h, onMounted, onUnmounted, reactive, ref, SetupContext, onBeforeUpdate, toRefs } from 'vue'
import { inBrowser } from './util'
import Lazy from './lazy'

export default (lazy: Lazy) => {
  return {
    props: {
      tag: {
        type: String,
        default: 'div'
      }
    },
    setup(props: { tag: string }, context: SetupContext) {
      const state = reactive({
        loaded: false
      })
      let rect: DOMRect | undefined
      const show = ref(false)
      const { tag } = toRefs(props)
      const root = ref<null | HTMLElement>(null)

      const getRect = () => {
        rect = root.value?.getBoundingClientRect()
      }

      const checkInView = () => {
        getRect()
        if (rect) {
          const topAndBottom = rect.top < window.innerHeight * lazy.options.preLoad && rect.bottom > rect.bottom
          const leftAndRight = rect.left < window.innerWidth * lazy.options.preLoad && rect.right > 0
          return inBrowser && topAndBottom && leftAndRight
        }
        return false
      }

      const load = () => {
        show.value = true
        state.loaded = true
        context.emit('show', root)
      }

      onMounted(() => {
        lazy.addLazyBox(root.value as HTMLElement)
        lazy.lazyLoadHandler()
      })

      onBeforeUpdate(() => {
        root.value = null
      })
      onUnmounted(() => {
        lazy.removeComponent(root.value as HTMLElement)
      })
      return h(tag, {
        ref: root
      })
    }
  }
}
