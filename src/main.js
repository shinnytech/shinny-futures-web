import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
// import './registerServiceWorker'
import './plugins/iview.js'
import './plugins/events.js'

Vue.config.productionTip = false


store.dispatch('init')

const RootData = {
  name: 'tianqin-web',
  windowHeight: window.innerHeight,
  windowWidth: window.innerWidth,
  appSplit: 0.6
}

const RootApp = new Vue({
  data: RootData,
  router,
  store,
  render: h => h(App),
  methods: {
    handlerResize: function(){
      RootData.windowHeight = window.innerHeight
      RootData.windowWidth = window.innerWidth
      this.$emit('global:resize')
    }
  },
  beforeCreate: () => console.log('beforeCreate'),
  created: () => {
    // https://developer.mozilla.org/en-US/docs/Web/Events/resize
    window.addEventListener("resize", resizeThrottler, false)
    let resizeTimeout;
    function resizeThrottler() {
      if ( !resizeTimeout ) {
        resizeTimeout = setTimeout(function() {
          resizeTimeout = null
          RootApp.handlerResize()
        }, 66)
      }
    }
  },
  beforeMount: () => console.log('beforeMount'),
  mounted: () => console.log('mounted'),
  beforeDestroy: () => console.log('beforeDestroy'),
  destroyed: () => console.log('destroyed')
}).$mount('#app')
