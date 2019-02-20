/* eslint-disable no-console */
import Vue from 'vue'
import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      console.log('Service worker has been registered.')
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      console.log('New content is downloading.')
    },
    updated () {
      console.log('New content is available; please refresh.')
      Vue.prototype.$Message.error('文件有更新，请刷新重试。')
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
      Vue.prototype.$Message.error('离线状态，请检测网络。')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
