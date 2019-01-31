
export default {
  getSelectedInstrumentId: (state, getters) => {
    return state.selectSymbol
  },
  getSelectedShowInstrumentId: (state, getters) => {
    return state.selectShowSymbol
  },
}
