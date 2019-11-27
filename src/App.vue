<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" /> -->
    <!-- <Demo1></Demo1> -->
    <!-- <Demo2></Demo2> -->
    <!-- <Demo3></Demo3> -->
    <Demo4></Demo4>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HelloWorld from './components/HelloWorld.vue'
import Demo1 from './components/Demo1.vue'
import Demo2 from './components/Demo2.vue'
import Demo3 from './components/Demo3.vue'
import Demo4 from './components/Demo4.vue'

@Component({
  components: {
    HelloWorld,
    Demo1,
    Demo2,
    Demo3,
    Demo4
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
