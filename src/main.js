import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./app.vue";
import router from "./router/index";
import store from "./vuex/index";

Vue.prototype.$tv_obj = undefined;
Vue.use(ElementUI);
Vue.prototype.$store = store;

router.beforeEach((to, from, next) => {
  if (!store.state.user) {
    console.log(11);
    next("/");
  } else {
    next();
    console.log(22);
  }
});


new Vue({
  el: "#app",
  router,
  render: h => h(App)
});
