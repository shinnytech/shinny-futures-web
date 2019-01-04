import Vue from 'vue'
import { DM } from './websockets'
import { InfoServerUrl } from '@/config'

export default { // 异步函数
  init ({ commit }) {
    fetch(InfoServerUrl, {
      headers: { Accept: 'application/json; charset=utf-8' }
    }).then(response => response.json())
    .then(data => {
      Vue.prototype.$Message.success('获取合约列表。')
      // 预处理 去掉 过期数据 / 期权
      for (let k in data) {
        if (data[k].expired || data[k].class === 'FUTURE_OPTION') delete data[k]
      }
      DM.mergeData({quotes: data}, true, false)

      commit('quotes/INIT_QUOTES', data)
      commit('SET_TAGS_QOUTES_MAP', data)
    })
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
      Vue.prototype.$Message.error('获取合约列表失败，请检查网络后刷新页面。')
    })
  }
}
