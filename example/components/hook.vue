<template>
  <div class="margin" />
  <img class="image" ref="lazyRef" width="100" />
</template>

<script lang="ts">
import { ref } from 'vue'
import { useLazyload } from '../../src'
export default {
  name: 'App',
  setup() {
    const src = ref('/example/assets/logo.png')
    const lazyRef = useLazyload(src, {
      lifecycle: {
        loading: () => {
          console.log('loading')
        },
        error: () => {
          console.log('error')
        },
        loaded: () => {
          console.log('loaded')
        }
      }
    })
    return {
      lazyRef
    }
  }
}
</script>

<style scoped>
.margin {
  margin-top: 1000px;
}

.image {
  display: block;
}

.image[lazy="loading"] {
  background: goldenrod;
}

.image[lazy="error"] {
  background: red;
}

.image[lazy="loaded"] {
  background: green;
}
</style>
