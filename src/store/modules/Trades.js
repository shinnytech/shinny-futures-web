import store from '@/store/index'
import BaseModule from './BaseModule'
const Trade = BaseModule({ 
//trade_key, 用于唯一标识一条成交记录. 对于一个USER, trade_key 是永远不重复的
  'user_id': '', //用户ID
  'order_id': '', //交易所单号
  'trade_id': '', //委托单ID, 对于一个USER, trade_id 是永远不重复的
  'exchange_id': '', //交易所
  'instrument_id': '', //在交易所中的合约代码
  'exchange_trade_id': '', //交易所单号
  'direction': '', //下单方向
  'offset': '', //开平标志
  'volume': 0, //成交手数
  'price': 0, //成交价格
  'trade_date_time': 0, //成交时间, epoch nano
  'commission': 0, //成交手续费
  'seqno': 0
})
export default {
  namespaced: true,
  state: {
    TradesList: [],
  },
  mutations: {
    UPDATE_TRADES: (state, payload) => {
      for (let id in payload) {
        if (!state[id]) { 
          store.registerModule(['trades', id], Trade) 
          state.TradesList.push(id)
        }
        store.commit('trades/' + id + '/UPDATE', payload[id])
      }
    }
  },
  getters: {
    GET_TRADES: (state) => {
      let result = []
      for (let i = 0; i < state.TradesList.length; i++) {
        result.push(state[state.TradesList[i]])
      }
      return result
    },
    GET_TRADES_DISTINCT_INSID: (state) => {
      let result = []
      let temp = new Set()
      for (let i = 0; i < state.TradesList.length; i++) {
        let instrumentId = state[state.TradesList[i]].instrument_id
        temp.add(instrumentId)
      }
      temp.forEach((value1, value2, set) => {
        result.push({text: value1, value: value1})
      })
      return result
    }
  }
}
