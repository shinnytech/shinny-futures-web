const InfoServerUrl = 'https://openmd.shinnytech.com/t/md/symbols/latest.json'
const QuotesServerUrl = 'wss://openmd.shinnytech.com/t/md/front/mobile'
const TradeServerUrl = 'wss://t.shinnytech.com/trade/shinny'
import {FormatDatetime, FormatPrice, FormatDirection, FormatOffset, FormatStatus} from '@/plugins/utils'

// const DefaultUser = {
//   bid: '快期模拟',
//   user_name: '18521096426',
//   password: '123456'
// }

const DefaultUser = {
  bid: 'simnow',
  user_name: '022632',
  password: '123456'
}


const QuotesTableRow = [
  {
    name: '合约代码',
    prop: 'instrument_id',
    width: 100
  }, {
    name: '最新价',
    prop: 'last_price',
    width: 60,
    className: function (item){
      return item['change'] > 0 ? 'R' : (item['change'] < 0 ? 'G' : '')
    },
    formatter: function (item) {
      return FormatPrice(item['last_price'], item['price_decs'])
    }
  }, {
    name: '时间',
    prop: 'datetime',
    width: 100,
    formatter: function (item) {
      return item['datetime'].slice(11, 23)
    }
  }, {
    name: '买价',
    prop: 'bid_price1',
    width: 60,
    className: 'col-buy',
    formatter: function (item) {
      return FormatPrice(item['bid_price1'], item['price_decs'])
    }
  }, {
    name: '买量',
    prop: 'bid_volume1',
    width: 60,
    className: 'col-buy',
  }, {
    name: '卖价',
    prop: 'ask_price1',
    width: 60,
    className: 'col-sell',
    formatter: function (item) {
      return FormatPrice(item['ask_price1'], item['price_decs'])
    }
  }, {
    name: '卖量',
    prop: 'ask_volume1',
    width: 60,
    className: 'col-sell'
  }, {
    name: '涨跌',
    prop: 'change',
    width: 60,
    className: function (item){
      return item['change'] > 0 ? 'R' : (item['change'] < 0 ? 'G' : '')
    },
    formatter: function (item) {
      return FormatPrice(item['change'], item['price_decs'])
    }
  }, {
    name: '涨跌幅',
    prop: 'change_percent',
    width: 60,
    className: function (item){
      return item['change'] > 0 ? 'R' : (item['change'] < 0 ? 'G' : '')
    },
    formatter: function (item) {
      let percent = FormatPrice(item['change'] / item['pre_settlement'] * 100, 2)
      return isNaN(percent) ? '-' : percent + '%'
    }
  }, {
    name: '成交量',
    prop: 'volume',
    width: 60,
    className: function (item){
      return item['change'] > 0 ? 'R' : (item['change'] < 0 ? 'G' : '')
    }
  }, {
    name: '今开盘',
    prop: 'open',
    width: 60,
    formatter: function (item) {
      return FormatPrice(item['open'], item['price_decs'])
    }
  }, {
    name: '收盘',
    prop: 'close',
    width: 60,
    formatter: function (item) {
      return FormatPrice(item['close'], item['price_decs'])
    }
  }, {
    name: '涨停',
    prop: 'upper_limit',
    width: 60,
    formatter: function (item) {
      return FormatPrice(item['upper_limit'], item['price_decs'])
    }
  },{
    name: '跌停',
    prop: 'lower_limit',
    width: 60,
    formatter: function (item) {
      return FormatPrice(item['lower_limit'], item['price_decs'])
    }
  },{
    name: '最高价',
    prop: 'highest',
    width: 60,
    formatter: function (item) {
      return FormatPrice(item['highest'], item['price_decs'])
    }
  },{
    name: '最低价',
    prop: 'lowest',
    width: 60,
    formatter: function (item) {
      return FormatPrice(item['lowest'], item['price_decs'])
    }
  },{
    name: '持仓量',
    prop: 'open_interest',
    width: 60
  },{
    name: '昨持',
    prop: 'pre_open_interest',
    width: 60
  },{
    name: '昨成交',
    prop: 'pre_volume',
    width: 60
  },{
    name: '昨收',
    prop: 'pre_close',
    width: 60,
    formatter: function (item) {
      return FormatPrice(item['pre_close'], item['price_decs'])
    }
  },{
    name: '昨结算',
    prop: 'pre_settlement',
    width: 60,
    formatter: function (item) {
      return FormatPrice(item['pre_settlement'], item['price_decs'])
    }
  }
]

export {
  InfoServerUrl,
  QuotesServerUrl,
  TradeServerUrl,
  DefaultUser,
  QuotesTableRow
}
