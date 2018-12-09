import TqWebSocket from './websocket'
import DataManager from './datamanager'

import {QuotesServerUrl, TradeServerUrl} from '@/config'

const QuoteWs = new TqWebSocket(QuotesServerUrl)
const TradeWs = new TqWebSocket(TradeServerUrl)
const DM = new DataManager()

if (process.env.NODE_ENV === 'development') {
  // 开发环境
  window.dm = DM
}

QuoteWs.addEventListener('message', message => {
  if (message.aid === 'rtn_data') {
    DM.mergeData(message.data)
  }
})

function WebSocketPlugin(store) {
  QuoteWs.addEventListener('message', message => {
    if (message.aid === 'rtn_data') {
      for (let i in message.data) {
        store.commit('MERGE_QUOTE_WS_DATA', message.data[i])
      }
    }
    QuoteWs.send('{"aid":"peek_message"}')
  })
  TradeWs.addEventListener('message', message => {
    switch (message.aid) {
      case 'rtn_data':
        for (let i in message.data) {
          store.commit('MERGE_TRADE_WS_DATA', message.data[i])
        }
        TradeWs.send('{"aid":"peek_message"}')
        break
      case 'rtn_brokers':
        store.commit('SET_BROKERS', message.brokers)
    }
  })

  QuoteWs.addEventListener('open',() => {
    store.commit('SET_WS_CONNECT_STATUS', {
      quoteWsConnected: true
    })
  })
  TradeWs.addEventListener('open',() => {
    store.commit('SET_WS_CONNECT_STATUS', {
      tradeWsConnected: true
    })
  })

  QuoteWs.addEventListener('close',() => {
    store.commit('SET_WS_CONNECT_STATUS', {
      quoteWsConnected: false
    })
  })
  TradeWs.addEventListener('close',() => {
    store.commit('SET_WS_CONNECT_STATUS', {
      tradeWsConnected: false
    })
  })



  store.subscribe(mutation => {
    if (['LOGIN', 'INSERT_ORDER', 'CANCEL_ORDER', 'TRANSFER'].includes(mutation.type)) {
      TradeWs.send('{"aid":"peek_message"}')
    }
  })
}

export {
  QuoteWs,
  TradeWs,
  DM,
  WebSocketPlugin
}
