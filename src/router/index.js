import Vue from 'vue'
import Router from 'vue-router'
import Quotes from '../views/Quotes.vue'
import User from '../views/User.vue'
import Chart from '../views/Charts.vue'
import Tags from '../store/tags'

Vue.use(Router)

export default new Router({
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
        // quotes: () => import(/* webpackChunkName: "Charts" */ './views/Charts.vue'), // lazy-loaded
        user: User
      }
    },
    {
      path: '/*',
      redirect: '/quotes/' + Tags[0].id  // DefaultTag
    }]
})
