import Vue from 'vue'
import iView from 'iview'
import 'iview/dist/styles/iview.css'
// import './assets/fonticon.css'

Vue.use(iView, {
  transfer: true, // 所有带浮层的组件，是否将浮层放置在 body 内
  size: 'small' // 所有带有 size 属性的组件的尺寸 small large
})
