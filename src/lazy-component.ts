import { h } from 'vue'
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
    render () {
      return h(this.tag, null, this.show ? this.$slots.default() : null)
    },
    data () {
      return {
        el: null,
        state: {
          loaded: false
        },
        rect: {},
        show: false
      }
    },
    mounted () {
      this.el = this.$el    
      console.log(this);
              
      lazy.addLazyBox(this)
      lazy.lazyLoadHandler()
      
    },
    beforeUnmount () {
      lazy.removeComponent(this)
    },
    methods: {
      getRect () {
        this.rect = this.$el.getBoundingClientRect()
      },
      checkInView () {
        this.getRect()
        return inBrowser &&
                    (this.rect.top < window.innerHeight * lazy.options.preLoad && this.rect.bottom > 0) &&
                    (this.rect.left < window.innerWidth * lazy.options.preLoad && this.rect.right > 0)
      },
      load () {        
        this.show = true
        this.state.loaded = true
        this.$emit('show', this)            
      },
      // destroy () {
      //   return this.$destroy
      // }
    }
  }
}
