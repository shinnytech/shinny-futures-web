import store from '@/store/index'
import BaseModule from './BaseModule'

const Position = BaseModule({
  // 交易所和合约代码
  'user_id': '', // 用户ID
  'exchange_id': '', // 交易所
  'instrument_id': '', // 合约在交易所内的代码
  // 持仓手数与冻结手数
  'volume_long_today': 0, // 多头今仓持仓手数
  'volume_long_his': 0, // 多头老仓持仓手数
  'volume_long': 0, // 多头持仓手数
  'volume_long_frozen_today': 0, // 多头今仓冻结手数
  'volume_long_frozen_his': 0, // 多头老仓冻结手数
  'volume_short_today': 0, // 空头今仓持仓手数
  'volume_short_his': 0, // 空头老仓持仓手数
  'volume_short': 0, // 空头持仓手数
  'volume_short_frozen_today': 0, // 空头今仓冻结手数
  'volume_short_frozen_his': 0, // 空头老仓冻结手数
  // 成本, 现价与盈亏
  'open_price_long': 0, // 多头开仓均价
  'open_price_short': 0, // 空头开仓均价
  'open_cost_long': 0, // 多头开仓成本
  'open_cost_short': 0, // 空头开仓成本
  'position_price_long': 0, // 多头持仓均价
  'position_price_short': 0, // 空头持仓均价
  'position_cost_long': 0, // 多头持仓成本
  'position_cost_short': 0, // 空头持仓成本
  'last_price': 0, // 最新价
  'float_profit_long': 0, // 多头浮动盈亏
  'float_profit_short': 0, // 空头浮动盈亏
  'float_profit': 0, // 浮动盈亏 = float_profit_long + float_profit_short
  'position_profit_long': 0, // 多头持仓盈亏
  'position_profit_short': 0, // 空头持仓盈亏
  'position_profit': 0, // 持仓盈亏 = position_profit_long + position_profit_short
  // 保证金占用
  'margin_long': 0, // 多头持仓占用保证金
  'margin_short': 0, // 空头持仓占用保证金
  'margin': 0 // 持仓占用保证金 = margin_long + margin_short
})

const PositionsModule = {
  namespaced: true,
  state: {
    PositionsList: [],
    PositionsSymbolsList: []
  },
  mutations: {
    UPDATE_POSITIONS: (state, payload) => {
      for (let symbol in payload) {
        if (!state[symbol]) {
          store.registerModule(['positions', symbol], Position)
          state.PositionsList.push(symbol)
        } 
        store.commit('positions/' + symbol + '/UPDATE', payload[symbol])
      }
      for (let i = 0; i < state.PositionsList.length; i++) {
        let symbol = state[state.PositionsList[i]].exchange_id + '.' + state[state.PositionsList[i]].instrument_id
        if (!state.PositionsSymbolsList.includes(symbol)) state.PositionsSymbolsList.push(symbol)
      }
    }
  },
  getters: {
    GET_POSITION: (state) => (symbol) => state[symbol],
    GET_POSITIONS: (state) => {
      let result = []
      for (let i = 0; i < state.PositionsList.length; i++) {
        if (state[state.PositionsList[i]].volume_long > 0 || state[state.PositionsList[i]].volume_short > 0)
          result.push(state[state.PositionsList[i]])
      }
      return result
    }
  }
}

export default PositionsModule
