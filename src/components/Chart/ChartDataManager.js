import EventTarget from '@/store/websockets/event'

export default class ChartDM extends EventTarget {
  static CHART_ID = 'web_kline_chart'

  constructor(opts) {
    super()
    this.dm = opts.dm;
    this.ws = opts.ws;
    this._symbol = opts.symbol ? opts.symbol : null
    this._duration = opts.duration ? opts.duration : null
    this._barNumbers = 100
    this._left_kline_id = null

    if (this.klinesPath) this.dm.subscribe(this.klinesPath, this.update.bind(this))
    this.sendToServer()
  }

  get view_width() {
    return this._barNumbers
  }

  set view_width(width) {
    // set 整个图像能容纳柱子个数
    if (this._barNumbers === width) return
    this._barNumbers = width
    this.sendToServer()
  }

  get symbol() {
    return this._symbol;
  }

  set symbol(symbol) {
    if (this._symbol === symbol) return
    // 取消订阅原来的数据
    if (this.klinesPath) this.dm.unsubscribe(this.klinesPath, this.update)
    // 更新后订阅新的数据
    this._symbol = symbol
    this._left_kline_id = null
    if (this.klinesPath) this.dm.subscribe(this.klinesPath, this.update.bind(this))
    this.sendToServer()
  }

  get duration() {
    return this._duration
  }

  set duration(duration) {
    if (this._duration === duration) return;
    // 取消订阅原来的数据
    if (this.klinesPath) this.dm.unsubscribe(this.klinesPath, this.update)
    // 更新后订阅新的数据
    this._duration = duration
    this._left_kline_id = null
    if (this.klinesPath) this.dm.subscribe(this.klinesPath, this.update.bind(this))
    this.sendToServer()
  }

  get left_kline_id() {
    return this._left_kline_id
  }

  set left_kline_id(id) {
    this._left_kline_id = id
    this.sendToServer()
  }

  get klinesPath() {
    return (this.symbol && this.duration) ? 'klines/' + this.symbol + '/' + this.duration : ''
  }

  get ticksPath() {
    return (this.symbol && this.duration === 0) ? 'ticks/' + this.symbol : ''
  }

  get quote() {
    if (this.symbol) return this.dm.getByPath('quotes/' + this.symbol)
    return null
  }

  get chart() {
    return this.dm.getByPath('charts/' + ChartDM.CHART_ID)
  }

  get klines() {
    return this.klinesPath ? this.dm.getByPath(this.klinesPath) : null
  }

  get ticks() {
    return this.ticksPath ? this.dm.getByPath(this.ticksPath) : null
  }

  get left_id() {
    return (this.chart
      && this.chart.state
      && this.chart.state.duration === this._duration
      && this.chart.state.ins_list === this._symbol
      && this.chart.left_id) ? this.chart.left_id : -1
  }

  get right_id() {
    return (this.chart
      && this.chart.state
      && this.chart.state.duration === this._duration
      && this.chart.state.ins_list === this._symbol
      && this.chart.right_id) ? this.chart.right_id : -1
  }

  update() {
    if (this.klines.last_id && this.right_id >= this.klines.last_id) {
      this.fire('update')
    }
  }

  // 移动 moves 个柱子 正数向右 负数向左
  moves(moves) {
    let temp_left_kline_id = (this.left_kline_id ? this.left_kline_id : this.left_id) - moves
    let temp_right_kline_id = temp_left_kline_id + this.view_width - 1
    let last_id = this.klines.last_id
    if (temp_left_kline_id >= 0 && temp_left_kline_id <= last_id ) {
      this.left_kline_id = temp_right_kline_id === this.last_id ? null : temp_left_kline_id
      return true
    }
    return false
  }

  sendToServer() {
    if (!this.symbol || !this.duration) return
    if (this.left_kline_id) {
      this.ws.send({
        aid: 'set_chart',
        chart_id: 'web_kline_chart',
        ins_list: this.symbol,
        duration: this.duration,
        view_width: this.view_width,
        left_kline_id: this.left_kline_id
      })
    } else {
      this.ws.send({
        aid: 'set_chart',
        chart_id: 'web_kline_chart',
        ins_list: this.symbol,
        duration: this.duration,
        view_width: this.view_width
      })
    }
  }
}
