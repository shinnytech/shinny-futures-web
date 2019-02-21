export default class ChartBar {
	static BAR_PADDING_RATE = 0.1
	static BAR_WIDTH_DEFAULT = 9
	static BAR_WIDTH_MAX = 55
	static BAR_WIDTH_MIN = 3

	constructor(opts) {
		this._width = opts.width ? opts.width : null
		this._barWidth = opts.barWidth ? opts.barWidth : ChartBar.BAR_WIDTH_DEFAULT
		this.resetChartParams()
	}

	resetChartParams() {
		// 由 this._width this._barWidth 确定一下参数
		this._barNumbers = Math.floor(this._width / this._barWidth)
		this._barPadding = Math.max(1, Math.round(this._barWidth * ChartBar.BAR_PADDING_RATE))
	}

	set width(w) {
		this._width = Math.round(w)
		this.resetChartParams()
	}

	set barWidth(w) {
		w = Math.round(w)
		w = w % 2 === 0 ? w + 1 : w
		if (w < ChartBar.BAR_WIDTH_MIN || w > ChartBar.BAR_WIDTH_MAX || w === this._barWidth) return
		this._barWidth = w
		this.resetChartParams()
	}

	set barNumbers(n) {
		this._barNumbers = n
		this._barWidth = this._width / this._barNumbers
		this._barPadding = this._barWidth * ChartBar.BAR_PADDING_RATE
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
}
