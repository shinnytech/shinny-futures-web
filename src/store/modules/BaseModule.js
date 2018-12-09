export default (obj) => {
  return {
    namespaced: true,
    state () {
      return Object.assign({}, obj)
    },
    mutations: {
      UPDATE: (state, payload) => Object.assign(state, payload)
    }
  }
}