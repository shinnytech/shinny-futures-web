import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import './iview.js'

Vue.config.productionTip = false

// ------------------- router -------------------
import Router from 'vue-router'
import Quotes from './views/Quotes.vue'
import User from './views/User.vue'
import Chart from './views/Charts.vue'
import Tags from '@/store/tags'
Vue.use(Router)
const router = new Router({
  routes: [
    {
      path: '/quotes/:tag',
      name: 'quotes',
      components: {
        quotes: Quotes,
        user: User
      }
    },
    {
      path: '/charts/:instrument_id',
      name: 'charts',
      components: {
        quotes: Chart,
        //() => import(/* webpackChunkName: "Charts" */ './views/Charts.vue'), // lazy-loaded
        user: User
      }
    },
    {
      path: '/*',
      redirect: '/quotes/' + Tags[0].id  // DefaultTag
    }]
})

// ------------------- store -------------------
import store from './store/index'
store.dispatch('init')

let rootData = {
  name: 'tianqin-web',
  windowHeight: window.innerHeight,
  windowWidth: window.innerWidth,
  appSplit: 0.6
}

new Vue({
  data: rootData,
  router,
  store,
  render: h => h(App),
  beforeCreate: () => console.log('beforeCreate'),
  created: () => {
    // https://developer.mozilla.org/en-US/docs/Web/Events/resize
    window.addEventListener("resize", resizeThrottler, false)
    let resizeTimeout;
    function resizeThrottler() {
      if ( !resizeTimeout ) {
        resizeTimeout = setTimeout(function() {
          resizeTimeout = null;
          actualResizeHandler();
        }, 66);
      }
    }
    function actualResizeHandler() {
      rootData.windowHeight = window.innerHeight
      rootData.windowWidth = window.innerWidth
    }
  },
  beforeMount: () => console.log('beforeMount'),
  mounted: () => console.log('mounted'),
  beforeDestroy: () => console.log('beforeDestroy'),
  destroyed: () => console.log('destroyed')
}).$mount('#app')
