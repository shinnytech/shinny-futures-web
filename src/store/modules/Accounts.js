import store from '@/store/index'
import BaseModule from './BaseModule'
const Account = BaseModule({
      'balance': '账户权益',
      'available': '可用资金',
      'pre_balance': '账户权益',
      'deposit': '入金金额',
      'withdraw': '出金金额',
      'commission': '手续费',
      'premium': '权利金',
      'static_balance': '静态权益',
      'position_profit': '持仓盈亏',
      'float_profit': '浮动盈亏',
      'risk_ratio': '风险度',
      'margin': '占用资金',
      'frozen_margin': '冻结保证金',
      'frozen_commission': '冻结手续费',
      'frozen_premium': '冻结权利金',
      'close_profit': '平仓盈亏'
})

export default {
  namespaced: true,
  state: {
    AccountsList: []
  },
  mutations: {
    UPDATE_ACCOUNTS: (state, payload) => {
      for (let id in payload) {
        if (!state[id]) store.registerModule(['accounts', id], Account)
        store.commit('accounts/' + id + '/UPDATE', payload[id])
      }
    }
  },
  getters: {
    GET_ACCOUNT: (state) => {
      let result = {}
      for (let k in state.CNY) {
        let n = state.CNY[k]
        if (k === 'risk_ratio') n = (n * 100).toFixed(2) + '%'
        else if (typeof n === 'number' && n % 1 !== 0) n = (n).toFixed(2)
        result[k] = n
      }
      return result
    },
    GET_ACCOUNTS: (state) => state.AccountsList
  }
}
