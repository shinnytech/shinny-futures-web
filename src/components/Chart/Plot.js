import * as d3 from 'd3'
import Candle from './plot/candlestick'
import Ohlc from './plot/ohlc'
import Volume from "./plot/volume";
import Oi from "./plot/oi";
import Close from "./plot/close"
import Indicator from './indicator/indicator'

class Plot_SVG_G {
	constructor(opts) {
		this.id = opts.id
		this.type = opts.type
		this.name = opts.name
		this.xScale = opts.xScale
		this.yScale = opts.yScale
		this.chartDm = opts.chartDm
		this.calculator = opts.calculator
		this.otherPaths = {}
		this.init()
	}

	init() {
		switch (this.type) {
			case 'candle':
				this.path = new Candle({
					name: this.name,
					plot: this
				})
				break
			case 'ohlc':
				this.path = new Ohlc({
					name: this.name,
					plot: this
				})
				break
			case 'day':
				this.path = new Close({
					name: this.name,
					plot: this
				})
				break
			case 'volume':
				this.path = new Volume({
					name: this.name,
					plot: this
				})
				break
			case 'oi':
				this.path = new Oi({
					name: this.name,
					plot: this
				})
				break
			default:
				this.path = new Indicator({
					calculator: this.calculator,
					name: this.id,
					plot: this
				})
				break
		}
	}

	range(l, r) {
		let list = this.chartDm.klines.slice(l, r + 1)
		switch (this.type) {
			case 'ohlc':
			case 'candle':
				return [d3.min(list, d => d && d['low']), d3.max(list, d => d && d['high'])]
			case 'day':
				return d3.extent(list, d => d && d['close'])
			case 'volume':
				return [0, d3.max(list, d => d && d['volume'])]
			case 'oi':
				return d3.extent(list, d => d && d['close_oi'])
			default:
				this.path.calculator.calc(l, r, this.chartDm.klines)
				return this.path.calculator.range(l, r)
		}
	}

	draw() {
		// for (let k in this.indicators) {
		// 	this.indicators[k].calculator.calc(this.chartDm.left_id, this.chartDm.right_id, this.chartDm.klines)
		// }
		//
		// for (let k in this.indicators) {
		// 	let paths = this.indicators[k].calcPaths(this.chartDm.left_id, this.chartDm.right_id, this.chartDm.klines)
		// 	for (let key in paths) {
		// 		this.g.select(`path.${k}.${key}`).attr('d', paths[key])
		// 	}
		// }
	}

	destroy () {

	}

	showIndicator(name, isShow = true) {
		for (let k in this.indicators) {
			if (k === name) {
				this.g.selectAll(`path.${k}`)
					.attr("visibility", isShow ? "visible" : "hidden")
			}
		}
	}
}

export default Plot_SVG_G
