import store from '@/store/index'
import BaseModule from './BaseModule'

const Bank = BaseModule({ 
  'id': '',
  'name': ''
})

export default {
  namespaced: true,
  state: {
    BanksList: []
  },
  mutations: {
    UPDATE_BANKS: (state, payload) => {
      for (let id in payload) {
        if (!state[id]) store.registerModule(['banks', id], Bank)
        if (payload[id] === null) {
          let index = state.BanksList.indexOf(state[id])
          if (index > -1) state.BanksList.splice(index, 1)
          store.unregisterModule(['banks', id])
        } else {
          store.commit('banks/' + id + '/UPDATE', payload[id])
          if (state.BanksList.includes(state[id])) state.BanksList.push(state[id])
        }
      }
    }
  },
  getters: {
    GET_POSITIONS: (state) => state.BanksList
  }
}
