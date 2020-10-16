<template>
 <div class="margin"></div>
  <!-- <img
    alt="Vue logo"
    v-lazy="
      'http://t8.baidu.com/it/u=1484500186,1503043093&fm=79&app=86&f=JPEG?w=1280&h=853'
    "
  />-->
 
  <img alt="Vue logo" v-lazy="'/example/assets/logo.png'" />
  <img alt="Vue logo" v-lazy="'/example/assets/logo.png'" ref="root" /> 
  <!-- <lazy-component  v-for="(img, index) in IMGS" :key="index" @show="lazyShow">
    <img :src="img" :data="img" width="500"/>
  </lazy-component> -->
  <lazy-image src="http://t7.baidu.com/it/u=3204887199,3790688592&fm=79&app=86&f=JPEG?w=4610&h=2968"></lazy-image>
</template>

<script>
import { inject, provide } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
export default {
  name: "App",
  components: {
    HelloWorld,
  },
  setup() {
    const useLazyLoad = inject("Lazyload");
    // useLazyLoad.config({
    //   loading: "http://covteam.u.qiniudn.com/test19.jpg",
    // });

    useLazyLoad.$on("loaded", (listener) => {
      console.table(useLazyLoad.performance());
    });
    const IMGS = [
      "http://t7.baidu.com/it/u=3204887199,3790688592&fm=79&app=86&f=JPEG?w=4610&h=2968",
      "http://t8.baidu.com/it/u=3571592872,3353494284&fm=79&app=86&f=JPEG?w=1200&h=1290",
      "http://t7.baidu.com/it/u=3616242789,1098670747&fm=79&app=86&f=JPEG?w=900&h=1350",
      "http://t8.baidu.com/it/u=2247852322,986532796&fm=79&app=86&f=JPEG?w=1280&h=853",
      "http://t7.baidu.com/it/u=3204887199,3790688592&fm=79&app=86&f=JPEG?w=4610&h=2968",
      "http://t9.baidu.com/it/u=583874135,70653437&fm=79&app=86&f=JPEG?w=3607&h=2408",
      "http://t9.baidu.com/it/u=1307125826,3433407105&fm=79&app=86&f=JPEG?w=5760&h=3240",
      "http://t9.baidu.com/it/u=2268908537,2815455140&fm=79&app=86&f=JPEG?w=1280&h=719",
    ];
    const lazyShow = (event) => {
      // console.log('lazyShow', lazyShow);
    }
    return {
      IMGS,
      lazyShow
    }
  },
};
</script>

<style>
.margin {
  margin-top: 1000px;
}
</style>
