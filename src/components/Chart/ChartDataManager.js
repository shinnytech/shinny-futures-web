import EventTarget from '@/store/websockets/event'
import tqsdk from '@/plugins/tqsdk'

export default class ChartDM extends EventTarget {
  static CHART_ID = 'web_kline_chart'
  static BAR_PADDING_RATE = 0.1
  static BAR_WIDTH_DEFAULT = 9
  static BAR_NUMBERS_MAX = 55
  static BAR_NUMBERS_MIN = 3

  constructor (opts) {
    super()
    this.dm = opts.dm
    this.ws = opts.ws
    this.xScale = opts.xScale
    this._symbol = opts.symbol ? opts.symbol : null
    this._duration = opts.duration ? opts.duration : null
    this._width = opts.width ? opts.width : null

    this._barWidth = ChartDM.BAR_WIDTH_DEFAULT
    this._barPadding = Math.max(1, Math.round(this._barWidth * ChartDM.BAR_PADDING_RATE))
    this._barNumbers = Math.floor(this._width / this._barWidth)

    this._left_id = -1 // 真实绘图 left_id
    this._right_id = -1 // 真实绘图 right_id

    if (this.klinesPath) {
      this.dm.subscribe(this.klinesPath, this.update.bind(this))
      this.sendToServer()
    }
  }

  resetChartParams () {
    // 由 this._width this._barWidth 确定一下参数
    this._barNumbers = Math.floor(this._width / this._barWidth)
    this._barPadding = Math.max(1, Math.round(this._barWidth * ChartDM.BAR_PADDING_RATE))
    // 以右边为准重新计算 _left_id _right_id
    let temp_left_id = this._right_id - this._barNumbers + 1
    this._left_id = temp_left_id < 0 ? 0 : temp_left_id
    this._right_id = this._left_id + this._barNumbers - 1
    this.sendToServer()
  }

  set width (w) {
    this._width = w
    this.resetChartParams()
  }

  set barWidth (w) {
    w = w % 2 === 0 ? w + 1 : w
    if (w < ChartDM.BAR_NUMBERS_MIN || w > ChartDM.BAR_NUMBERS_MAX || w === this._barWidth) return
    this._barWidth = w
    this.resetChartParams()
  }

  get barWidth () {
    return this._barWidth
  }

  get barPadding () {
    return this._barPadding
  }

  get barNumbers () {
    return this._barNumbers
  }

  get symbol () {
    return this._symbol
  }

  set symbol (symbol) {
    if (this._symbol === symbol) return
    // 取消订阅原来的数据
    if (this.klinesPath) this.dm.unsubscribe(this.klinesPath, this.update)
    // 更新后订阅新的数据
    this._symbol = symbol
    this._left_id = this._right_id = -1
    if (this.klinesPath) this.dm.subscribe(this.klinesPath, this.update.bind(this))
    this.sendToServer()
  }

  get duration () {
    return this._duration
  }

  set duration (duration) {
    if (this._duration === duration) return
    // 取消订阅原来的数据
    if (this.klinesPath) this.dm.unsubscribe(this.klinesPath, this.update)
    // 更新后订阅新的数据
    this._duration = duration
    this._left_id = this._right_id = -1
    if (this.klinesPath) this.dm.subscribe(this.klinesPath, this.update.bind(this))
    this.sendToServer()
  }

  get klinesPath () {
    return (this.symbol && this.duration) ? 'klines/' + this.symbol + '/' + this.duration : ''
  }

  get ticksPath () {
    return (this.symbol && this.duration === 0) ? 'ticks/' + this.symbol : ''
  }

  get quote () {
    return this._symbol ? this.dm.getQuote(this.symbol) : null
  }

  get chart () {
    return this.dm.getByPath('charts/' + ChartDM.CHART_ID)
  }

  get klines () {
    return (this._symbol && this._duration) ? this.dm.getKlines(this._symbol, this._duration) : null
  }

  get ticks () {
    return this._symbol ? this.dm.getKlines(this._symbol) : null
  }

  get left_id () {
    return this._left_id
  }

  get right_id () {
    return this._right_id
  }

  get chart_left_id () {
    return (this.chart
      && this.chart.state
      && this.chart.state.duration === this._duration
      && this.chart.state.ins_list === this._symbol
      && this.chart.left_id) ? this.chart.left_id : -1
  }

  get chart_right_id () {
    return (this.chart
      && this.chart.state
      && this.chart.state.duration === this._duration
      && this.chart.state.ins_list === this._symbol
      && this.chart.right_id) ? this.chart.right_id : -1
  }

  get chart_last_id () {
    return (this.klines && this.klines.last_id) ? this.klines.last_id : -1
  }

  update () {
    if (this.klines && this.klines.last_id && this.klines.last_id > -1) {
      if (this._left_id === -1 || this._right_id === -1) {
        // 初始化情况
        if (this.chart_right_id && this.chart_right_id > -1) {
          this._right_id = this.chart_right_id
          this._left_id = this._right_id - this._barNumbers + 1
          this.fire('update')
        }
      } else {
        // 更新
        if (this._right_id >= this.klines.last_id - 1) {
          this._right_id = (this._right_id + 1 === this.klines.last_id) ? this._right_id + 1 : this._right_id
          this._left_id = this._right_id - this._barNumbers + 1
        }
        this.fire('update')
      }
    }
  }

  // 移动 moves 个柱子 正数向右 负数向左
  moves (moves) {
    if (this._left_id === -1) return
    let temp_left_kline_id = this._left_id - moves
    let temp_right_kline_id = temp_left_kline_id + this._barNumbers - 1
    let last_id = this.klines.last_id
    if (temp_left_kline_id >= 0 && temp_left_kline_id <= last_id) {
      [this._left_id, this._right_id] = [temp_left_kline_id, temp_right_kline_id]
      this.sendToServer()
      return true
    }
    return false
  }

  sendToServer () {
    if (!this.symbol || !this.duration) return
    if (this._right_id > -1 && this._right_id !== this.last_id) {
      this.ws.send({
        aid: 'set_chart',
        chart_id: ChartDM.CHART_ID,
        ins_list: this.symbol,
        duration: this.duration,
        view_width: this._barNumbers * 2,
        left_kline_id: this._left_id - this._barNumbers
      })
    } else {
      this.ws.send({
        aid: 'set_chart',
        chart_id: ChartDM.CHART_ID,
        ins_list: this.symbol,
        duration: this.duration,
        view_width: this._barNumbers * 2
      })
    }
  }
}
