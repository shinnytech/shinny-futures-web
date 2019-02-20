import Vue from 'vue'
import TQSDK from 'tqsdk'

let tqsdk = new TQSDK({
  symbolsServerUrl: 'https://openmd.shinnytech.com/t/md/symbols/latest.json',
  wsQuoteUrl: 'wss://openmd.shinnytech.com/t/md/front/mobile',
  wsTradeUrl: 'wss://t.shinnytech.com/trade/shinny',
  reconnectInterval: 3000,
  reconnectMaxTimes: 5,
  prefix: 'web'
})

const VERSION = Number(Vue.version.split('.')[0])
const NOOP = () => {}
let eventMap = {}
let vmEventMap = {}
let globalRE = /^global:/

let tqVmEventMap = {}
let tqsdkRE = /^tqsdk:/

function mixinEvents(Vue) {
  let on = Vue.prototype.$on
  let emit = Vue.prototype.$emit

  Vue.prototype.$on = function proxyOn(eventName, fn = NOOP) {
    const vm = this
    if (Array.isArray(eventName)) {
      eventName.forEach((item) => vm.$on(item, fn));
    } else if (globalRE.test(eventName)) {
      (vmEventMap[vm._uid] || (vmEventMap[vm._uid] = [])).push(eventName);
      (eventMap[eventName] || (eventMap[eventName] = [])).push(vm);
      on.call(vm, eventName, fn)
    } else if (tqsdkRE.test(eventName)) {
      if (!tqVmEventMap[vm._uid]) tqVmEventMap[vm._uid] = {}
      let tq_eventName = eventName.match(/^tqsdk:(.*)/)[1]
      if (!tqVmEventMap[vm._uid][tq_eventName]) tqVmEventMap[vm._uid][tq_eventName] = []
      tqVmEventMap[vm._uid][tq_eventName].push(fn)
      tqsdk.on(tq_eventName, fn.bind(vm))
    } else {
      on.call(vm, eventName, fn)
    }
    return vm
  }

  Vue.prototype.$emit = function proxyEmit(eventName, ...args) {
    const vm = this
    if (globalRE.test(eventName)) {
      const vmList = eventMap[eventName] || []
      vmList.forEach(item => emit.apply(item, [eventName, ...args]))
    } else {
      emit.apply(vm, [eventName, ...args])
    }
    return vm
  }
}

function applyMixin(Vue) {
  Vue.mixin({
    beforeDestroy() {
      const vm = this
      const events = vmEventMap[vm._uid] || [];
      events.forEach((event) => {
        const targetIdx = eventMap[event].findIndex(item => item._uid === vm._uid);
        eventMap[event].splice(targetIdx, 1);
      })
      delete vmEventMap[vm._uid];

      const tqevents = tqVmEventMap[vm._uid] || {};
      for (let eventName in tqevents) {
        let eventsArr = tqevents[eventName]
        eventsArr.forEach((fn) => {
          tqsdk.removeEventListener(eventName, fn)
        })
      }
      delete tqVmEventMap[vm._uid];

      Object.entries(eventMap).forEach(
        ([eventName, vmList]) => vmList.length || delete eventMap[eventName]
      )
    }
  })
}

function plugin(Vue) {
  if (VERSION < 2) {
    console.error('[vue-event-proxy] only support Vue 2.0+');
    return;
  }
  // Exit if the plugin has already been installed.
  if (plugin.installed) return
  plugin.installed = true
  mixinEvents(Vue)
  applyMixin(Vue)
}

Vue.use(plugin)

Vue.$tqsdk = tqsdk
Vue.prototype.$tqsdk = tqsdk

export default tqsdk;

