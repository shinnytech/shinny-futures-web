import {DM} from '@/store/websockets/index'
export default {
  getQuote: (state) => (symbol) => {
    return DM.getQuote(symbol)
  },
  getBrokers: (state) => {
    return state.brokers
  },
  getSelectedInstrumentId: (state, getters) => {
    return state.selectSymbol
  },
  getSelectedShowInstrumentId: (state, getters) => {
    return state.selectShowSymbol
  },
}
