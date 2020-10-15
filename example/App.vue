<template>
  <img
    alt="Vue logo"
    v-lazy="
      'http://t8.baidu.com/it/u=1484500186,1503043093&fm=79&app=86&f=JPEG?w=1280&h=853'
    "
  />
  <div class="margin"></div>
  <img alt="Vue logo" v-lazy="'/example/assets/logo.png'" />
  <img alt="Vue logo" v-lazy="'/example/assets/logo.png'" ref="root" />
  <HelloWorld msg="Hello Vue 3.0 + Vite" />
</template>

<script>
import { inject,provide  } from 'vue';
import HelloWorld from "./components/HelloWorld.vue";
export default {
  name: "App",
  components: {
    HelloWorld,
  },
  setup() {
    const useLazyLoad = inject('Lazyload')
    useLazyLoad.config({
      loading: 'http://covteam.u.qiniudn.com/test19.jpg'
    })
    
    useLazyLoad.$on("loaded",  (listener) => {
      console.table(useLazyLoad.performance());
    });
  }
};
</script>

<style>
.margin {
  margin-top: 1000px;
}
</style>
