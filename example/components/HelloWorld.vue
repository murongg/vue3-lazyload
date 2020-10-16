
<script>
import { h } from 'vue'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      count: 0
    }
  },
  render() {
    return h('h1', this.$slots.default)
  }
}
</script>
