import {
  inBrowser,
  loadImageAsync,
} from './util'
import Lazy from './lazy';
import { h } from 'vue'
export default (lazyManager: Lazy) => {
  return {
    props: {
      src: [String, Object],
      tag: {
        type: String,
        default: 'img'
      }
    },
    render() {
      return h(this.tag, {
        "vLazy": this.renderSrc
      })
    },
    data() {
      return {
        el: null,
        options: {
          src: '',
          error: '',
          loading: '',
          attempt: lazyManager.options.attempt
        },
        state: {
          loaded: false,
          error: false,
          attempt: 0
        },
        rect: {},
        renderSrc: ''
      }
    },
    watch: {
      src() {
        this.init()
        lazyManager.addLazyBox(this)
        lazyManager.lazyLoadHandler()
      }
    },
    created() {
     
    },
    mounted() {
      this.init()
      this.renderSrc = this.options.loading
      this.el = this.$el
      // console.log('this', this.el);
      
      lazyManager.addLazyBox(this)
      lazyManager.lazyLoadHandler()
    },
    beforeDestroy() {
      lazyManager.removeComponent(this)
    },
    methods: {
      init() {
        const { src, loading, error } = lazyManager._valueFormatter(this.src)
        console.log(loading);
        
        this.state.loaded = false
        this.options.src = src
        this.options.error = error
        this.options.loading = loading
        this.renderSrc = this.options.loading
      },
      getRect() {
        this.rect = this.$el.getBoundingClientRect()
      },
      checkInView() {
        this.getRect()
        return inBrowser &&
          (this.rect.top < window.innerHeight * lazyManager.options.preLoad && this.rect.bottom > 0) &&
          (this.rect.left < window.innerWidth * lazyManager.options.preLoad && this.rect.right > 0)
      },
      load(onFinish = () => {}) {
        if ((this.state.attempt > this.options.attempt - 1) && this.state.error) {
          if (!lazyManager.options.silent) console.log(`VueLazyload log: ${this.options.src} tried too more than ${this.options.attempt} times`)
          onFinish()
          return
        }
        const src = this.options.src as string
        loadImageAsync({ src }, ({ src }) => {
          this.renderSrc = src
          this.state.loaded = true
        }, e => {
          this.state.attempt++
          this.renderSrc = this.options.error
          this.state.error = true
        })
      }
    }
  }
}
