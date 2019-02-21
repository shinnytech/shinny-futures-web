/* eslint-disable */

// ma macd kdj boll sar

class Indicator {
	constructor(opts) {
		// 计算器
		this.calculator = new Calculator(opts.name) // max min createPaths calcPaths
		this.type = 'MAIN' // MAIN SUB
		this.dm = opts.ChartDM

	}

	init() {
		return "输出序列"
	}

	update() {
		return "path"
	}
}
