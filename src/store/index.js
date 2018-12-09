import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import getters from './getters'
import actions from './actions'
import Tags, { InitTagsQuotesMap } from '@/store/tags'
import { WebSocketPlugin } from './websockets/index'


import AccountModule from '@/store/modules/Accounts'
import PositionsModule from '@/store/modules/Positions'
import OrdersModule from '@/store/modules/Orders'
import TradersModule from '@/store/modules/Trades'
import TransfersModule from '@/store/modules/Transfers'
import BanksModule from '@/store/modules/Banks'
import QuotesModule from '@/store/modules/Quotes'
import KlinesModule from '@/store/modules/Klines'
import TicksModule from '@/store/modules/Ticks'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [WebSocketPlugin],
  modules: {
    // 行情
    'quotes': QuotesModule,
    // 交易
    'accounts': AccountModule,
    'positions': PositionsModule,
    'orders': OrdersModule,
    'trades': TradersModule,
    'transfers': TransfersModule,
    'banks': BanksModule
  },
  state: {
    // 用户交易
    brokers: [],
    bid: '',
    user_id: '',
    trading_day: '',
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
    // 图表
    periods: [
      {
        name: 'Day', // 日内
        seconds: 60 * 60 * 24
      }, {
        name: '1m',
        seconds: 60
      }, {
        name: '5m',
        seconds: 60 * 5
      }, {
        name: '1H',
        seconds: 60 * 60
      }, {
        name: '1D',
        seconds: 60 * 60 * 24
      }
    ]
  },
  mutations,
  getters,
  actions
})


