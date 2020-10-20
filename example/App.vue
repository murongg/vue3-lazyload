<template>
  <div class="margin" />
  <!-- <img v-lazy="'/example/assets/logo.png'" alt="Vue logo" width="100"> -->
  <img v-lazy="{src: errorlazy.src, lifecycle: errorlazy.lifecycle}" alt="Vue logo" class="image" width="100"> 
  <button @click="change">
    change
  </button>
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
      errorlazy.src = 'http://t8.baidu.com/it/u=3571592872,3353494284&fm=79&app=86&size=h300&n=0&g=4n&f=jpeg?sec=1603764281&t=bedd2d52d62e141cbb08c462183601c7'
    }
    return {
      errorlazy,
      change
    }
  }
}
</script>

<style>
.margin {
  margin-top: 1000px;
}
.image[lazy=loading] {
  background: goldenrod;
}
.image[lazy=error] {
  background: red;
}
.image[lazy=loaded] {
  background: green;
}
</style>
