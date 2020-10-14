<template>
  <img
    alt="Vue logo"
    v-lazy="
      'http://t8.baidu.com/it/u=1484500186,1503043093&fm=79&app=86&f=JPEG?w=1280&h=853'
    "
  />
  <div class="margin"></div>
  <img alt="Vue logo" v-lazy="'/example/assets/logo.png'" />
  <img alt="Vue logo" v-lazy="'/example/assets/logo.png'" ref="root"  />
  <HelloWorld msg="Hello Vue 3.0 + Vite" />
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import { ref, onMounted } from "vue";
export default {
  name: "App",
  components: {
    HelloWorld,
  },
  setup(props, context) {
    const root = ref(null);

    onMounted(() => {
      // DOM元素将在初始渲染后分配给ref
      console.log(root.value.getBoundingClientRect()); // <div>这是根元素</div>
    });
    return {
      root
    }
  },
};
</script>

<style>
.margin {
  margin-top: 1000px;
}
</style>
