import store from '@/store/index'
import BaseModule from './BaseModule'
const Tick = BaseModule({ 
  'datetime': 0, //UnixNano 北京时间
  'last_price': 0, //最新价
  'average': 0, //当日均价
  'highest': 0, //最高价
  'lowest': 0, //最低价
  'bid_price1': 0, //买一价
  'ask_price1': 0, //卖一价
  'bid_volume1': 0, //买一量
  'ask_volume1': 0, //卖一量
  'volume': 200, //成交量
  'amount': 0, //成交额
  'open_interest': 0 //持仓量
})

const Tick_Serial = {
  namespaced: true,
  state: {
    data: [],
    last_id: 0
  },
  mutations: {
    UPDATE_TICK_SERIAL: (state, payload) => {
      state.last_id = payload.last_id
      for (let id in payload['data']) {
        if (payload['data'] === null) delete state['data'][id]
        state['data'][id] = payload['data'][id]
      }
    }
  },
  getters: {
    GET_TICK_SERIAL: (state) => state
  }
}

export default {
  namespaced: true,
  state: {},
  mutations: {
    UPDATE_TICKS: (state, payload) => {
      for (let symbol in payload) {
        if (payload[symbol] === null) {
          store.unregisterModule(['ticks', symbol])
        } else {
          if (!state[symbol]) store.registerModule(['ticks', symbol], Tick_Serial)
          store.commit('ticks/'+symbol+'/UPDATE_TICK_SERIAL', payload[symbol])
        }
      }
    }
  },
  getters: {
    GET_TICKS: (state) =>  (symbol) => {
      if (!state[symbol]) store.registerModule(['ticks', symbol], Tick_Serial)
      return state[symbol]
    }
  }
}
