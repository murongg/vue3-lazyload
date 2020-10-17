<template>
 <div class="margin"></div>
  <img alt="Vue logo" v-lazy="'/example/assets/logo.png'" width="100"/>
  <img alt="Vue logo" v-lazy="'/example/assets/lo1go.png'" width="100" /> 
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
.margin {
  margin-top: 1000px;
}
</style>
