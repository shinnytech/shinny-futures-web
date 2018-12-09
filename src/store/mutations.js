import Vue from 'vue'
import store from '@/store/index'
import { RandomStr } from '@/plugins/utils'
import { QuoteWs, TradeWs } from './websockets/index'
import Tags from '@/store/tags'

export default {
  SET_WS_CONNECT_STATUS (state, payload) {
    Object.assign(state, payload)
  },
  SET_SELECTED_SYMBOL (state, payload) {
    state.selectSymbol = payload
  },
  SET_SELECTED_SHOW_SYMBOL (state, payload) {
    state.selectShowSymbol = payload
  },
  SET_TAGS_QOUTES_MAP (state, payload) {
    let result = {}
    // 分类
    for (let s in payload) {
      let symbol = payload[s]
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
  MERGE_QUOTE_WS_DATA (state, payload) {
    for (let key in payload) {
      switch (key) {
        case 'ins_list':
          state.ins_list = payload['ins_list'].split(',').filter((item)=>item.length > 0)
          break
        case 'quotes':
          store.commit('quotes/UPDATE_QUOTES', payload['quotes'])
          break
        default:
          break
      }
    }
  },
  MERGE_TRADE_WS_DATA (state, payload) {
    if (payload['notify']) {
      for (let k in payload['notify']) {
        let notify = payload['notify'][k]
        if (notify.type === 'SETTLEMENT') {
          state.confirm = 'doing'
          state.confirmContent = notify['content']
        } else if (notify.type === 'MESSAGE') {
          Vue.prototype.$Message.info(notify.content)
        } else {
          Vue.prototype.$Message.error(notify.content)
        }
      }
    }
    if (payload['trade'] && payload['trade'][state.user_id]) {
      let content = payload['trade'][state.user_id]
      for (let key in content) {
        // 跳过空对象
        if (Object.keys(content[key]).length === 0) continue
        switch (key) {
          case 'session':
            state.trading_day = content['session']['trading_day']
            break
          case 'accounts':
            store.commit('accounts/UPDATE_ACCOUNTS', content['accounts'])
            break
          case 'trades':
            store.commit('trades/UPDATE_TRADES', content['trades'])
            break
          case 'positions':
            store.commit('positions/UPDATE_POSITIONS', content['positions'])
            break
          case 'orders':
            store.commit('orders/UPDATE_ORDERS', content['orders'])
            break
          case 'transfers':
            store.commit('transfers/UPDATE_TRANSFERS', content['transfers'])
            break
          case 'banks':
            store.commit('banks/UPDATE_BANKS', content['banks'])
            break
        }
      }
    }
  },
  SET_BROKERS (state, brokers) {
    state.brokers = brokers
  },
  SUBSCRIBE_QUOTE (state, payload) {
    let posQuotes = state.positions.PositionsSymbolsList // 持仓合约
    let subscribeList = payload.concat(posQuotes)
    if (subscribeList.length > 0)
      QuoteWs.send({
        aid: 'subscribe_quote',
        ins_list: subscribeList.join(',')
      })
  },
  SET_TICK_CHART (state, payload) {
    QuoteWs.send({
      aid: 'set_chart', // 必填, 请求图表数据
      chart_id: 'web_tick_chart', // 必填, 图表id, 服务器只会维护每个id收到的最后一个请求的数据
      ins_list: payload.ins_list ? payload.ins_list.join(',') : payload.symbol, // 必填, 填空表示删除该图表，多个合约以逗号分割，第一个合约是主合约，所有id都是以主合约为准
      duration: 0, // 必填, 周期，单位ns, tick:0, 日线: 3600 * 24 * 1000 * 1000 * 1000
      view_width: payload.view_width ? payload.view_width : 100 // 必填, 图表宽度, 请求最新N个数据，并保持滚动(新K线生成会移动图表)
    })
  },
  SET_CHART (state, payload) {
    let content = {}
    if (payload.trading_day_start || payload.trading_day_count) {
      // 指定交易日，返回对应的数据
      content.trading_day_start = payload.trading_day_start ? payload.trading_day_start : 0
      // trading_day_count 请求交易日天数
      content.trading_day_count = payload.trading_day_count ? payload.trading_day_count : 3600 * 24 * 1e9
    } else {
      content.view_width = payload.view_width ? payload.view_width : 500
      if (payload.left_kline_id) {
        // 指定一个K线id，向右请求N个数据
        content.left_kline_id = payload.left_kline_id
      } else if (payload.focus_datetime) {
        // 使得指定日期的K线位于屏幕第M个柱子的位置
        content.focus_datetime = payload.focus_datetime // 日线及以上周期是交易日，其他周期是时间，UnixNano 北京时间
        content.focus_position = payload.focus_position ? payload.focus_position : 0
      }
    }
    QuoteWs.send(Object.assign({
        aid: 'set_chart',
        chart_id: 'web_kline_chart',
        ins_list: payload.ins_list ? payload.ins_list.join(',') : payload.symbol,
        duration: payload.duration
      }, content))
  },
  LOGIN (state, payload) {
    state.bid = payload.bid
    state.user_id = payload.user_name
    TradeWs.send({
      aid: 'req_login',
      bid: payload.bid,
      user_name: payload.user_name,
      password: payload.password
    })
  },
  CONFIRM_SETTLEMENT (state, payload) {
    state.confirm = 'done'
    TradeWs.send({
      aid: 'confirm_settlement'
    })
  },
  INSERT_ORDER (state, payload) {
    /*
    payload : {symbol, exchange_id, ins_id, direction, limitPrice, offset, volume}
    */
    let initOrder = {
      aid: 'insert_order',
      user_id: state.user_id,
      price_type: "LIMIT",
      volume_condition: "ANY",
      time_condition: "GFD",
      exchange_id: payload.exchange_id,
      instrument_id: payload.ins_id,
      direction: payload.direction,
      limit_price: payload.limitPrice
    }
    if (payload.exchange_id === 'SHFE' && payload.offset === 'CLOSE') {
      let position = store.getters['positions/GET_POSITION'](payload.symbol)
      // 拆单，先平今再平昨
      let closeTodayVolume = 0
      if (payload.direction === 'BUY' && position.volume_short_today > 0) {
        closeTodayVolume = Math.min(position.volume_short_today, payload.volume)
      } else if (payload.direction === 'SELL' && position.volume_long_today > 0) {
        closeTodayVolume = Math.min(position.volume_long_today, payload.volume)
      }
      if (closeTodayVolume > 0) {
        TradeWs.send(Object.assign({
          order_id: "TQWEB." + RandomStr(8),
          offset: 'CLOSETODAY',
          volume: closeTodayVolume
        }, initOrder))
      }
      if (payload.volume - closeTodayVolume > 0) {
        TradeWs.send(Object.assign({
          order_id: "TQWEB." + RandomStr(8),
          offset: 'CLOSE',
          volume: payload.volume - closeTodayVolume
        }, initOrder))
      }
    } else {
      TradeWs.send(Object.assign({
          order_id: "TQWEB." + RandomStr(8),
          offset: payload.offset,
          volume: payload.volume
        }, initOrder))
    }
  },
  CANCEL_ORDER (state, payload) {
    TradeWs.send({
      aid: 'cancel_order',
      user_id: state.user_id,
      order_id: payload.order_id
    })
  },
  TRANSFER (state, payload) {
    TradeWs.send({
      aid: 'req_transfer'
    })
  }
}
