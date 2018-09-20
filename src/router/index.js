import Vue from 'vue'
import router from 'vue-router'
import Index from "../view/index.vue";
import login from "../view/login.vue";
import trade from "../view/trade.vue";
import stock from "../components/trade-view/index.vue";

Vue.use(router)

export default new router({
    mode: 'history',
    routes: [{
        path: '/',
        name: 'index',
        component: Index
    }, {
        path: '/login',
        name: 'login',
        component: login
    }, {
        path: '/stock',
        name: 'stock',
        component: stock
    }, {
        path: '/trade',
        name: 'trade',
        component: trade
    }]
})
