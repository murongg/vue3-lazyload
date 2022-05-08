<template>
  <div class="navbar">
    <div class="navbar_button" :class="showType === 'Directive' ? 'active' : ''" @click="switchType('Directive')">
      Directive
    </div>
    <div class="space">|</div>
    <div class="navbar_button" :class="showType === 'Hook' ? 'active' : ''" @click="switchType('Hook')">Hook</div>
  </div>
  <Directive v-if="showType === 'Directive'"></Directive>
  <Hook v-else></Hook>
</template>

<script>
import { ref } from 'vue'
import Directive from './components/directive.vue'
import Hook from './components/hook.vue'
export default {
  name: 'App',
  components: { Directive, Hook },
  setup() {
    const showType = ref('Directive')
    const switchType = (type) => {
      showType.value = type
    }
    return {
      showType,
      switchType
    }
  }
}
</script>

<style>
.navbar {
  display: flex;
  justify-content: center;
}

.space {
  margin: 0 10px;
}

.navbar_button {
  cursor: pointer;
}

.navbar_button.active {
  color: cadetblue;
}
</style>
