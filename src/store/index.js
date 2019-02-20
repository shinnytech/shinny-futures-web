import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import getters from './getters'
import Tags, { InitTagsQuotesMap } from '@/store/tags'

Vue.use(Vuex)

let store = new Vuex.Store({
  state: {
    // 用户交易
    bid: '',
    user_id: '',
    logined: false,
    confirm: 'done', // doing / done
    confirmContent: '',
    selectShowSymbol: 'KQ.m@CFFEX.IF', // 全局选中的合约 显示信息
    selectSymbol: '', // 全局选中的合约 待交易
    // 网络连接
    quoteWsConnected: false,
    tradeWsConnected: false,
    // 行情
    ins_list: [], // 已订阅行情
    tags: Tags.map(x => x.id),
    tagsQuotesMap: InitTagsQuotesMap,
  },
  mutations,
  getters
})

export default store


