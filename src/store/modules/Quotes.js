import store from '@/store/index'
import BaseModule from './BaseModule'
const QuoteProto = Object.assign({
  instrument_id: '',
  class: '', // ['FUTURE' 'FUTURE_INDEX' 'FUTURE_CONT']
  ins_id: '', ins_name: '',
  exchange_id: '',
  sort_key: '',
  expired: false,
  py: '',
  product_id: '',
  product_short_name: '',
  underlying_product: '',
  underlying_symbol: '',
  delivery_year: 0,
  delivery_month: 0,
  expire_datetime: 0,
  trading_time: {},
  volume_multiple: 0, // 合约乘数
  price_tick: 0, // 合约价格单位
  price_decs: 0, // 合约价格小数位数
}, {
  // 行情
  max_market_order_volume: 1000, // 市价单最大下单手数
  min_market_order_volume: 1, // 市价单最小下单手数
  max_limit_order_volume: 1000, // 限价单最大下单手数
  min_limit_order_volume: 1, // 限价单最小下单手数
  margin: '-', // 每手保证金
  commission: '-', // 每手手续费
  datetime: '', // 时间
  ask_price1: '-', // 卖价
  ask_volume1: '-', // 卖量
  bid_price1: '-', // 买价
  bid_volume1: '-', // 买量
  last_price: '-', // 最新价
  change: '-',
  highest: '-', // 最高价
  lowest: '-', // 最低价
  lower_limit: '-', // 跌停
  upper_limit: '-', // 涨停
  open: '-', // 今开
  close: '-', // 收盘
  amount: '-', // 成交额
  volume: '-', // 成交量
  open_interest: '-', // 持仓量
  settlement: '-', // 结算价
  average: '-', // 均价
  pre_open_interest: '-', // 昨持
  pre_close: '-', // 昨收
  pre_volume: '-', // 昨成交量
  pre_settlement: '-' // 昨结
})
const Quote = BaseModule(QuoteProto)

export default {
  namespaced: true,
  state: {
    SymbolsList: [] // 可交易合约列表
  },
  mutations: {
    INIT_QUOTES: (state, payload) => {
      for (let symbol in payload) {
        store.registerModule(['quotes', symbol], Quote)
        store.commit('quotes/' + symbol + '/UPDATE', payload[symbol])
        if (payload[symbol].class === 'FUTURE') state.SymbolsList.push(symbol)
      }
    },
    UPDATE_QUOTES: (state, payload) => {
      for (let symbol in payload) {
        if (payload[symbol] !== null) store.commit('quotes/' + symbol + '/UPDATE', payload[symbol])
        state[symbol].change = state[symbol].last_price - state[symbol].pre_settlement
        if (isNaN(state[symbol].change)) {
          state[symbol].change = '-'
        }
      }
    }
  },
  getters: {
    GET_QUOTE: (state) => (symbol) => {
      return state[symbol]
    },
    GET_QUOTE_FIELD: (state) => (symbol, field) => {
      return state[symbol][field]
    },
    GET_QUOTES_BY_LIST: (state) => (quotesList) => {
      return quotesList.map(s => state[s])
    },
    GET_QUOTES_BY_INPUT: (state) => (str) => {
      // 在 可交易合约列表 中 根据输入 str 筛选出 提示合约列表
      let result = []
      str = str.toLowerCase()
      for (let i in state.SymbolsList) {
        let symbol = state[state.SymbolsList[i]]
        if (symbol.instrument_id.toLowerCase().includes(str) || symbol.ins_name.toLowerCase().includes(str)) result.push(symbol.instrument_id)
      }
      if (result.length > 0) return result
      for (let i in state.SymbolsList) {
        let symbol = state[state.SymbolsList[i]]
        if (symbol.py.includes(str)) result.push(symbol.instrument_id)
      }
      return result
    }
  }
}
