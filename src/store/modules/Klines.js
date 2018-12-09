import store from '@/store/index'
import BaseModule from './BaseModule'
const Kline = BaseModule({ 
  'datetime': 0, //UnixNano 北京时间，如果是日线，则是交易日的 UnixNano
  'open': 0, //开
  'high': 0, //高
  'low': 0, //低
  'close': 0, //收
  'volume': 0, //成交量
  'open_oi': 0, //起始持仓量
  'close_oi': 0 //结束持仓量
})

const Kline_Data = {
  namespaced: true,
  state: {
    path: ''
  },
  mutations: {
    INIT: (state, payload) => {
      state.path = payload.path
    }, 
    UPDATE: (state, payload) => {
      for (let id in payload) {
        if (payload[id] === null) {
          store.unregisterModule(['klines', state.path, 'data', id])
        } else {
          if (!state[id]) {
            store.registerModule(['klines', state.path, 'data', id], Kline)
          }
          store.commit('klines/' + state.path + '/data/' + id + '/UPDATE', payload[id])
        }
      }
    }
  },
  getters: {}
}

const Kline_Serial = {
  namespaced: true,
  modules: {
    data: Kline_Data
  },
  state: {
    data: {},
    path: '',
    last_id: 0,
    trading_day_start_id: 0, // 该交易日起始的元素的编号
    trading_day_end_id: 0 // 该交易日结束的元素的编号
  },
  mutations: {
    INIT_KLINE_SERIAL: (state, payload) => {
      state.path = payload.path
      store.commit(['klines/' + state.path + '/data/INIT'], payload)
    },
    UPDATE_KLINE_SERIAL: (state, payload) => {
      state.last_id = payload.last_id
      state.trading_day_start_id = payload.trading_day_start_id
      state.trading_day_end_id = payload.trading_day_end_id
      store.commit(['klines/' + state.path + '/data/UPDATE'], payload['data'])
    }
  },
  getters: {}
}

export default {
  namespaced: true,
  state: {},
  mutations: {
    UPDATE_Klines: (state, payload) => {
      // 以 path = symbol + '_' + interval 为 key， 减少一个层级
      for (let symbol in payload) {
        if (payload[symbol] === null) {
          for (let path in state) {
            if (path.startsWith(symbol)) store.unregisterModule(['klines', path])
          }
        } else {
          for (let interval in payload[symbol]){
            let path = symbol + '_' + interval
            if (payload[symbol][interval] === null && state[path]) {
              store.unregisterModule(['klines', path])
            } else if (payload[symbol][interval]) {
              if (!state[path]) {
                store.registerModule(['klines', path], Kline_Serial)
                store.commit('klines/' + path + '/INIT_KLINE_SERIAL', {path})
              }
              store.commit(['klines/' + path + '/UPDATE_KLINE_SERIAL'], payload[symbol][interval])
            }
          }
        }
      }
    }
  },
  getters: {}
}
