<template>
  <div class="margin" />
  <!-- <img v-lazy="'/example/assets/logo.png'" alt="Vue logo" width="100"> -->
  <h1>Primary</h1>
  <img
    v-lazy="{ src: errorlazy.src, lifecycle: errorlazy.lifecycle }"
    alt="Vue logo"
    class="image"
    width="100"
  />
  <button @click="change">change</button>
  <h1>v-for</h1>
  <img
    v-for="item in defaultImages"
    v-lazy="{ src: item }"
    alt="Vue logo"
    class="image"
    width="100"
  />
</template>

<script>
import { reactive } from 'vue'
export default {
  name: 'App',
  setup() {
    const errorlazy = reactive({
      src: '/example/assets/log1o.png',
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
      errorlazy.src = 'http://img.mm4000.com/file/8/91/3b3c5819be_1044.jpg'
    }
    return {
      errorlazy,
      change,
      defaultImages: [
        'http://img.mm4000.com/file/8/91/3b3c5819be_1044.jpg',
        'http://img.mm4000.com/file/8/91/ec3ee1aeed_1044.jpg',
        'http://img.mm4000.com/file/8/91/b177ba87cf_1044.jpg',
        'http://img.mm4000.com/file/8/91/8a3bb1e8ba_1044.jpg',
        'http://img.mm4000.com/file/8/91/77f37a191f_1044.jpg'
      ]
    }
  }
}
</script>

<style>
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
