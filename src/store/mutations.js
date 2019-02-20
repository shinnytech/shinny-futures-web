import Tags from '@/store/tags'

export default {
  SET_BROKERS (state, brokers) {
    state.brokers = brokers
  },
  SET_TAGS_QOUTES_MAP (state, payload) {
    let result = {}
    // 分类
    for (let s in payload) {
      let symbol = payload[s]
      if (symbol.expired) continue
      for (let i in Tags) {
        let tag = Tags[i]
        if ( tag.func(symbol)  ) {
          if (result[tag.id]) result[tag.id].push(s)
          else result[tag.id] = [s]
        }
      }
    }
    // 排序
    for (let tag in result) {
      result[tag].sort((a, b) => {
        let sort = payload[a].sort_key - payload[b].sort_key
        return sort === 0 ? payload[a].ins_id - payload[b].ins_id : sort
      })
    }
    state.tagsQuotesMap = result
  },
  SET_LOGIN(state, payload){
    state.logined = payload
  },
  SET_SETTLEMENT (state, payload) {
    state.confirm = 'doing'
    state.confirmContent = payload['content']
  },
  /// /// /// /// /// /// /// /// /// /// /// ///
  SET_WS_CONNECT_STATUS (state, payload) {
    Object.assign(state, payload)
  },
  SET_SELECTED_SYMBOL (state, payload) {
    state.selectSymbol = payload
  },
  SET_SELECTED_SHOW_SYMBOL (state, payload) {
    state.selectShowSymbol = payload
  }
}
