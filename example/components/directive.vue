<template>
  <div class="margin" />
  <!-- <img v-lazy="'/example/assets/logo.png'" alt="Vue logo" width="100"> -->
  <h1>Primary</h1>
  <img v-lazy="{ src: errorlazy.src, lifecycle: errorlazy.lifecycle, error: errorlazy.error }" alt="error image" class="image" width="100" />
  <button @click="change">change</button>
  <h1>v-for</h1>
  <img v-for="item in defaultImages" v-lazy="{ src: item }" alt="Vue logo" class="image" width="100" />
</template>

<script>
import { reactive } from 'vue'
export default {
  name: 'App',
  setup() {
    const errorlazy = reactive({
      src: '/example/assets/log1o.png',
      error: '12.png',
      lifecycle: {
        loading: () => {
          console.log('image loading')
        },
        error: () => {
          console.log('image error')
        },
        loaded: () => {
          console.log('image loaded')
        }
      }
    })
    const change = () => {
      errorlazy.src = 'https://picsum.photos/300/300'
    }
    return {
      errorlazy,
      change,
      defaultImages: [
        'https://picsum.photos/200/300',
        'https://picsum.photos/300/300',
        'https://picsum.photos/400/300',
        'https://picsum.photos/500/300',
      ]
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
