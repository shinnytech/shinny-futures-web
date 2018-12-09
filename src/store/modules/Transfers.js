import store from '@/store/index'
import BaseModule from './BaseModule'
const Transfer = BaseModule({ 
  'datetime': 0, //转账时间, epoch nano
  'currency': '',  //币种
  'amount': 0, //金额
  'error_id': 0, //转账结果代码
  'error_msg': ""
})
export default {
  namespaced: true,
  state: {
    TransfersList: [],
  },
  mutations: {
    UPDATE_TRANSFERS: (state, payload) => {
      for (let id in payload) {
        if (!state[id]) { store.registerModule(['transfers', id], Trade) }
        store.commit('transfers/' + id + '/UPDATE', payload[id])
        if (!state.TransfersList.includes(state[id])) state.TransfersList.push(state[id])
      }
    }
  },
  actions: {},
  getters: {
    GET_TRANSFERS: (state) => state.TransfersList
  }
}
