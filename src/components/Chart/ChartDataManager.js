
const CHART_ID = 'web_kline_chart'
const BAR_PADDING_RATE = 0.1
const BAR_WIDTH_DEFAULT = 13
const BAR_NUMBERS_MAX = 55
const BAR_NUMBERS_MIN = 3

class ChartDM {

	constructor(opts) {
		this.tqsdk = opts.tqsdk

		this.mainType = 'candle'
		this._symbol = opts.symbol ? opts.symbol : null
		this._duration = opts.duration ? opts.duration : null
		this._width = opts.width ? opts.width : null

		this._barWidth = BAR_WIDTH_DEFAULT
		this._barPadding = Math.max(1, Math.round(this._barWidth * BAR_PADDING_RATE))
		this._barNumbers = Math.floor(this._width / this._barWidth)

		this._left_id = -1 // 真实绘图 left_id
		this._right_id = -1 // 真实绘图 right_id

		// tqsdk.on('rtn_data', this.update.bind(this))
		this.sendToServer()
	}

	resetChartParams() {
		// 由 this._width this._barWidth 确定一下参数
		this._barNumbers = Math.floor(this._width / this._barWidth)
		this._barPadding = Math.max(1, Math.round(this._barWidth * BAR_PADDING_RATE))
		// 以右边为准重新计算 _left_id _right_id
		let temp_left_id = this._right_id - this._barNumbers + 1
		this._left_id = temp_left_id < 0 ? 0 : temp_left_id
		this._right_id = this._left_id + this._barNumbers - 1
		this.sendToServer()
	}

	set width(w) {
		this._width = w
		this.resetChartParams()
	}

	set barWidth(w) {
		w = w % 2 === 0 ? w + 1 : w
		if (w < BAR_NUMBERS_MIN || w > BAR_NUMBERS_MAX || w === this._barWidth) return
		this._barWidth = w
		this.resetChartParams()
	}

	get barWidth() {
		return this._barWidth
	}

	get barPadding() {
		return this._barPadding
	}

	get barNumbers() {
		return this._barNumbers
	}

	get symbol() {
		return this._symbol
	}

	set symbol(symbol) {
		if (this._symbol === symbol) return
		// 更新后订阅新的数据
		this._symbol = symbol
		this._left_id = this._right_id = -1
		this.sendToServer()
	}

	get duration() {
		return this._duration
	}

	set duration(duration) {
		if (this._duration === duration) return
		this._duration = duration
		this._left_id = this._right_id = -1
		this.sendToServer()
	}

	get klinesPath() {
		return (this.symbol && this.duration) ? 'klines/' + this.symbol + '/' + this.duration : ''
	}

	get quote() {
		return this._symbol ? this.tqsdk.get_quote(this._symbol) : null
	}

	get klines() {
		return (this._symbol && this._duration) ? this.tqsdk.get_klines(this._symbol, this._duration) : null
	}

	get left_id() {
		return this._left_id
	}

	get right_id() {
		return this._right_id
	}

	get_chart(key) {
		let chart = this.tqsdk.get_by_path('charts/' + CHART_ID)
		if (chart
			&& chart.state
			&& chart.state.duration === this._duration
			&& chart.state.ins_list === this._symbol){
			switch (key){
				case "left_id":
					return chart.left_id ? chart.left_id : -1
				case "right_id":
					return chart.right_id ? chart.right_id : -1
				default:
					return chart
			}
		} else {
			return null
		}
	}

	get_klines_last_id() {
		return (this.klines && this.klines.last_id) ? this.klines.last_id : -1
	}

	update() {
		if (this.get_klines_last_id() > -1) {
			if (this.mainType === 'day') {
				if (this._left_id === -1 || this._right_id === -1) {
					// 初始化情况
					this._left_id = this.get_chart('left_id')
					this._right_id = this.get_klines_last_id()
				} else {
					// 更新
					this._right_id = this.get_klines_last_id()
				}
				this._barNumbers = this.get_chart('right_id') - this.get_chart('left_id') + 1
				this._barWidth = this._width / this._barNumbers

			} else {
				if (this._left_id === -1 || this._right_id === -1) {
					// 初始化情况
					let chart_right_id = this.get_chart('right_id')
					if (chart_right_id && chart_right_id > -1) {
						this._right_id = chart_right_id
						this._left_id = this._right_id - this._barNumbers + 1
					}
				} else {
					// 更新
					if (this._right_id >= this.klines.last_id - 1) {
						this._right_id = (this._right_id + 1 === this.klines.last_id) ? this._right_id + 1 : this._right_id
						this._left_id = this._right_id - this._barNumbers + 1
					}
				}
			}
		}

	}

	// 移动 moves 个柱子 正数向右 负数向左
	moves(moves) {
		if (this.mainType === 'day') return
		if (this._left_id === -1) return
		let temp_left_kline_id = this._left_id - moves
		let temp_right_kline_id = temp_left_kline_id + this._barNumbers - 1
		if (temp_left_kline_id >= 0 && temp_left_kline_id <= this.get_klines_last_id()) {
			[this._left_id, this._right_id] = [temp_left_kline_id, temp_right_kline_id]
			this.sendToServer()
			return true
		}
		return false
	}

	sendToServer() {
		if (!this._symbol || !this._duration) return
		if (this.mainType === 'day'){
			this.tqsdk.set_chart({
				chart_id: CHART_ID,
				symbol: this._symbol,
				duration: this._duration,
				trading_day_start: 0
			})
		} else {
			if (this._right_id > -1 && this._right_id !== this.get_klines_last_id()) {
				this.tqsdk.set_chart({
					chart_id: CHART_ID,
					symbol: this._symbol,
					duration: this._duration,
					view_width: this._barNumbers * 2,
					left_kline_id: this._left_id - this._barNumbers
				})
			} else {
				this.tqsdk.set_chart({
					chart_id: CHART_ID,
					symbol: this._symbol,
					duration: this._duration,
					view_width: this._barNumbers * 2
				})
			}
		}

	}
}

export default ChartDM
