import Vue from 'vue'
import TQSDK from 'tqsdk'

let tqsdk = new TQSDK({
	symbolsServerUrl: 'https://openmd.shinnytech.com/t/md/symbols/latest.json',
	wsQuoteUrl: 'wss://openmd.shinnytech.com/t/md/front/mobile',
	wsTradeUrl: 'wss://otg-sim.shinnytech.com/trade?access_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJobi1MZ3ZwbWlFTTJHZHAtRmlScjV5MUF5MnZrQmpLSFFyQVlnQ0UwR1JjIn0.eyJqdGkiOiJkYzEzMzBkYS1lMWZkLTQzYTItOWU3Ny1hNWE5M2U3NWY2YzEiLCJleHAiOjE2MTI0MDMwNDgsIm5iZiI6MCwiaWF0IjoxNTgwODY3MDQ4LCJpc3MiOiJodHRwczovL2F1dGguc2hpbm55dGVjaC5jb20vYXV0aC9yZWFsbXMvc2hpbm55dGVjaCIsInN1YiI6IjRiYjJhMGRjLTI2ZDEtNDNmNS05ZDY3LTk5ZGM1ZGRhOGNmZSIsInR5cCI6IkJlYXJlciIsImF6cCI6InNoaW5ueV93ZWIiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI2Y2Y4NzZhZS1jOGQ0LTRlMWEtYjFlNS00Mjk5NTI2ZTZhYjkiLCJhY3IiOiIxIiwic2NvcGUiOiJhdHRyaWJ1dGVzIiwiZ3JhbnRzIjp7ImZlYXR1cmVzIjpbIiJdLCJhY2NvdW50cyI6WyIqIl19fQ.Doy459Bacf4RzJDU5g_wxaKa9S736AHx8DSoBI3qOKnNuq8exCDqCgk6fxhwlfnzm_dJhMGi-VS8SquqrT3U00wB_ODJ0GN7HqVUdiXxKLKNwL7d3vqPHKqtEq0srVYDMZ6wGWQj8v7jjv0omeqt9Y1OZvjNC9pOo_Jb44umYcfGXQMdPbUtN1IxL_YosVdiTblHaDymaFrx7qiJWDT0pXBacysA2_rhG1mBlRkd0GYmiu07giXhNW_ZCyvXne5t1bMDC53mxByzqKXILNUvp4c3j0FkoVVdUyLkac4wZMREzZmchWfy5OpH9PvCfpnc-CS-ZPDB_XAQVAXkuf2TeQ',
	reconnectInterval: 3000,
	reconnectMaxTimes: 5,
	prefix: 'web'
})

window.tqsdk = tqsdk

const VERSION = Number(Vue.version.split('.')[0])
const NOOP = () => {
}
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
			let temp_fn = fn.bind(vm)
			tqVmEventMap[vm._uid][tq_eventName].push(temp_fn)
			tqsdk.on(tq_eventName, temp_fn)
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

