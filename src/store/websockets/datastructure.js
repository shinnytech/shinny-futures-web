/* eslint-disable vue/no-parsing-error */

// Number.EPSILON
// Number.MAX_SAFE_INTEGER
// Number.MAX_VALUE
// Number.MIN_SAFE_INTEGER
// Number.MIN_VALUE
//
// Number.NaN
// Number.POSITIVE_INFINITY
// Number.NEGATIVE_INFINITY
//
// Number.isFinite()
// Number.isInteger()
// Number.isNaN()
// Number.isSafeInteger()
// Number.parseFloat()
// Number.parseInt()
// Number.prototype.toExponential()
// Number.prototype.toFixed()
// Number.prototype.toLocaleString()
// Number.prototype.toPrecision()
// Number.prototype.toSource()
// Number.prototype.toString()
// Number.prototype.valueOf()

const DataStructure = {
  QUOTE : {
    instrument_id: '',
    class: '', // ['FUTURE' 'FUTURE_INDEX' 'FUTURE_CONT']
    ins_id: '',
    ins_name: '',
    exchange_id: '',
    sort_key: '',
    expired: false,
    py: '',
    product_id: '',
    product_short_name: '',
    underlying_product: '',
    underlying_symbol: '', // 标的合约
    delivery_year: 0,
    delivery_month: 0,
    expire_datetime: 0,
    trading_time: {},
    volume_multiple: 0, // 合约乘数
    price_tick: 0, // 合约价格单位
    price_decs: 0, // 合约价格小数位数

    datetime: '', // "2017-07-26 23:04:21.000001" (行情从交易所发出的时间(北京时间))
    _last_price: '-', // 最新价 NaN
    ask_price1: '-', // 卖一价 NaN
    ask_volume1: '-', // 卖一量 0
    bid_price1: '-', // 买一价 NaN
    bid_volume1: '-', // 买一量 0
    highest: '-', // 当日最高价 NaN
    lowest: '-', // 当日最低价 NaN
    open: '-', // 开盘价 NaN
    close: '-', // 收盘价 NaN
    average: '-', // 当日均价 NaN
    volume: '-', // 成交量 0
    amount: '-', // 成交额 NaN
    open_interest: '-', // 持仓量 0
    lower_limit: '-', // 跌停 NaN
    upper_limit: '-', // 涨停 NaN
    settlement: '-', // 结算价 NaN
    change: '-', // 涨跌
    change_percent: '-', // 涨跌幅
    strike_price: NaN, // 行权价
    pre_open_interest: '-', // 昨持仓量
    pre_close: '-', // 昨收盘价
    pre_volume: '-', // 昨成交量
    _pre_settlement: '-', // 昨结算价
    max_market_order_volume: 1000, // 市价单最大下单手数
    min_market_order_volume: 1, // 市价单最小下单手数
    max_limit_order_volume: 1000, // 限价单最大下单手数
    min_limit_order_volume: 1, // 限价单最小下单手数
    margin: '-', // 每手保证金
    commission: '-', // 每手手续费

    set last_price (p) {
      this._last_price = p
      this.setChange()
    },
    get last_price () {
      return this._last_price
    },
    set pre_settlement (p) {
      this._pre_settlement = p
      this.setChange()
    },
    get pre_settlement () {
      return this._pre_settlement
    },
    setChange(){
      if (Number.isFinite(this._last_price) && Number.isFinite(this._pre_settlement) && this._pre_settlement != 0) {
        this.change = this._last_price - this._pre_settlement
        this.change_percent = this.change / this._pre_settlement * 100
      }
    }
  },
  KLINE: {
    datetime: 0, // 1501080715000000000 (K线起点时间(按北京时间)，自unix epoch(1970-01-01 00:00:00 GMT)以来的纳秒数)
    open: NaN, // K线起始时刻的最新价
    close: NaN, // K线结束时刻的最新价
    high: NaN, // K线时间范围内的最高价
    low: NaN, // K线时间范围内的最低价
    open_oi: 0, // K线起始时刻的持仓量
    close_oi: 0, // K线结束时刻的持仓量
    volume: 0 // K线时间范围内的成交量
  },
  TICK: {
    datetime: 0, // 1501074872000000000 (tick从交易所发出的时间(按北京时间)，自unix epoch(1970-01-01 00:00:00 GMT)以来的纳秒数)
    last_price: NaN, // 最新价
    average: NaN, // 当日均价
    highest: NaN, // 当日最高价
    lowest: NaN, // 当日最低价
    ask_price1: NaN, // 卖一价
    ask_volume1: 0, // 卖一量
    bid_price1: NaN, // 买一价
    bid_volume1: 0, // 买一量
    volume: 0, // 当日成交量
    amount: NaN, // 成交额
    open_interest: NaN, // 持仓量
  },
  TRADE: {
    user_id: '',
    order_id: '', // 委托单ID, 对于一个用户的所有委托单，这个ID都是不重复的
    trade_id: '', // 成交ID, 对于一个用户的所有成交，这个ID都是不重复的
    exchange_id: '', // 'SHFE' 交易所
    instrument_id: '', // 'rb1901' 交易所内的合约代码
    exchange_trade_id: '', // 交易所成交单号
    direction: '', // 下单方向 (BUY=买, SELL=卖)
    offset: '', // 开平标志 (OPEN=开仓, CLOSE=平仓, CLOSETODAY=平今)
    volume: 0, // 成交手数
    price: 0, // 成交价格
    trade_date_time: 0, // 成交时间, epoch nano
    commission: 0, // 成交手续费
    seqno: 0
  },
  ORDER: {
    // order_id, 用于唯一标识一个委托单. 对于一个USER, order_id 是永远不重复的
    // 委托单初始属性 (由下单者在下单前确定, 不再改变)
    user_id: '', // 用户ID
    order_id: '', // 委托单ID, 对于一个USER, order_id 是永远不重复的
    exchange_id: '', // 交易所
    instrument_id: '', // 在交易所中的合约代码
    direction: '', // 下单方向 (BUY=买, SELL=卖)
    offset: '', // 开平标志 (OPEN=开仓, CLOSE=平仓, CLOSETODAY=平今)
    volume_orign: 0, // 总报单手数
    price_type: '', // 指令类型 (ANY=市价, LIMIT=限价)
    limit_price: 0, // 委托价格, 仅当 price_type = LIMIT 时有效
    time_condition: '', // 时间条件 (IOC=立即完成，否则撤销, GFS=本节有效, *GFD=当日有效, GTC=撤销前有效, GFA=集合竞价有效)
    volume_condition: '', // 数量条件 (ANY=任何数量, MIN=最小数量, ALL=全部数量)
    // 下单后获得的信息(由期货公司返回, 不会改变)
    insert_date_time: 0, // 1501074872000000000 下单时间(按北京时间)，自unix epoch(1970-01-01 00:00:00 GMT)以来的纳秒数
    exchange_order_id: '', // 交易所单号
    // 委托单当前状态
    status: '', // 委托单状态, (ALIVE=有效, FINISHED=已完)
    volume_left: 0, // 未成交手数
    frozen_margin: 0, // 冻结保证金
    last_msg: '', // "报单成功" 委托单状态信息
    // 内部序号
    seqno: 0
  },
  POSITION: {
    // 交易所和合约代码
    user_id: '', // 用户ID
    exchange_id: '', // 'SHFE' 交易所
    instrument_id: '', // 'rb1901' 交易所内的合约代码
    // 持仓手数与冻结手数
    volume_long_today: 0, // 多头今仓持仓手数
    volume_long_his: 0, // 多头老仓持仓手数
    volume_long: 0, // 多头持仓手数
    volume_long_frozen_today: 0, // 多头今仓冻结手数
    volume_long_frozen_his: 0, // 多头老仓冻结手数
    volume_long_frozen: 0, // 多头持仓冻结

    volume_short_today: 0, // 空头今仓持仓手数
    volume_short_his: 0, // 空头老仓持仓手数
    volume_short: 0, // 空头持仓手数
    volume_short_frozen_today: 0, // 空头今仓冻结手数
    volume_short_frozen_his: 0, // 空头老仓冻结手数
    volume_short_frozen: 0, // 空头持仓冻结

    // 成本, 现价与盈亏
    open_price_long: 0, // 多头开仓均价
    open_price_short: 0, // 空头开仓均价
    open_cost_long: 0, // 多头开仓市值
    open_cost_short: 0, // 空头开仓市值
    position_price_long: 0, // 多头持仓均价
    position_price_short: 0, // 空头持仓均价
    position_cost_long: 0, // 多头持仓市值
    position_cost_short: 0, // 空头持仓市值
    last_price: 0, // 最新价
    float_profit_long: 0, // 多头浮动盈亏
    float_profit_short: 0, // 空头浮动盈亏
    float_profit: 0, // 浮动盈亏 = float_profit_long + float_profit_short
    position_profit_long: 0, // 多头持仓盈亏
    position_profit_short: 0, // 空头持仓盈亏
    position_profit: 0, // 持仓盈亏 = position_profit_long + position_profit_short
    // 保证金占用
    margin_long: 0, // 多头持仓占用保证金
    margin_short: 0, // 空头持仓占用保证金
    margin: 0 // 持仓占用保证金 = margin_long + margin_short
  },
  BANK: {
    id: '',
    name: ''
  },
  ACCOUNT: {
    currency: '', // "CNY" (币种)
    balance: NaN, // 账户权益
    available: NaN, // 可用资金
    pre_balance: NaN, // 昨日账户权益
    deposit: NaN, // 入金金额 本交易日内的入金金额
    withdraw: NaN, // 出金金额 本交易日内的出金金额
    commission: NaN, // 手续费 本交易日内交纳的手续费
    premium: NaN, // 权利金 本交易日内交纳的权利金
    static_balance: NaN, // 静态权益
    position_profit: NaN, // 持仓盈亏
    float_profit: NaN, // 浮动盈亏
    risk_ratio: NaN, // 风险度
    margin: NaN, // 保证金占用
    frozen_margin: NaN, // 冻结保证金
    frozen_commission: NaN, // 冻结手续费
    frozen_premium: NaN, // 冻结权利金
    close_profit: NaN // 本交易日内平仓盈亏
  }
}

let GenPrototype = (k) => new Object(DataStructure[k.toUpperCase()])

export default GenPrototype
