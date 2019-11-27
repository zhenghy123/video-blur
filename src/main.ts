import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VueDraggableResizable from 'vue-draggable-resizable';
// import './main.css'

// optionally import default styles
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

Vue.component('vue-draggable-resizable', VueDraggableResizable);

Vue.config.productionTip = false;
Vue.config.devtools = true;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
