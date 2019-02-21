import * as d3 from 'd3'
import ChartDM from './ChartDataManager'
import Plot from './plot/plot'
import Loading from './plot/loading'
import Crosshair from './plot/crosshair'

import MA from './indicator/ma'
import BOLL from './indicator/boll'
import SVG_G from "./plot/svg_g";

let formatMillisecond = d3.timeFormat(".%L"),
	formatSecond = d3.timeFormat(":%S"),
	formatMinute = d3.timeFormat("%H:%M"),
	formatHour = d3.timeFormat("%H:%M"),
	formatDay = d3.timeFormat("%m%d"),
	formatMonth = d3.timeFormat("%m%d"),
	formatYear = d3.timeFormat("%y");

function MultiFormat(date) {
	return (d3.timeSecond(date) < date ? formatMillisecond
		: d3.timeMinute(date) < date ? formatSecond
			: d3.timeHour(date) < date ? formatMinute
				: d3.timeDay(date) < date ? formatHour
					: d3.timeMonth(date) < date ? formatDay
						: d3.timeYear(date) < date ? formatMonth
							: formatYear)(date);
}

class PlotsManager {
	static PLOT_PADDING = 2 // 图表中间间隔

	constructor(plotsNumber, height, width) {
		this._height = height
		this._width = width
		this._plotsNumber = plotsNumber ? plotsNumber : 2
		this.positions = []
		this.initLayout()
	}

	set width(h) {
		this._width = h
		this.initLayout()
	}

	get width() {
		return this._width
	}

	set height(h) {
		this._height = h
		this.initLayout()
	}

	get height() {
		return this._height
	}

	set plotsNumber(n) {
		this._plotsNumber = n
		this.initLayout()
	}

	get plotsNumber() {
		return this._plotsNumber
	}

	initLayout() {
		let avg = 1 / this.plotsNumber
		let first = avg + avg * 0.3 * (this.plotsNumber - 1)
		let others = avg * 0.7
		let avalibleHeight = this.height - PlotsManager.PLOT_PADDING * (this.plotsNumber - 1)
		this.positions[0] = {
			width: this._width,
			height: avalibleHeight * first,
			top: 0
		}
		for (let i = 1; i < this.plotsNumber; i++) {
			this.positions[i] = {
				width: this._width,
				height: avalibleHeight * others,
				top: this.positions[i - 1].top + this.positions[i - 1].height + PlotsManager.PLOT_PADDING
			}
		}
	}
}

class ChartYAxis {
	constructor(opts) {
		this.parentG = opts.parentG
		this.align = opts.align === 'right' ? 'right' : 'left'

		this._height = opts.height ? opts.height : 0
		this._width = opts.width ? opts.width : 0

		this.g = this.parentG
			.append('g')
			.attr('class', 'y axis ' + this.align)

		this.yScale = d3.scaleLinear().range([this._height, 0])
		this.yAxis = d3.axisLeft().scale(this.yScale)

		if (this.align === 'right') {
			this.g.attr("transform", "translate(" + this._width + ",0)")
		}
	}

	get height() {
		return this._height
	}

	set height(h) {
		this._height = h
		this.yScale.range([this._height, 0])
	}

	get width() {
		return this._width
	}

	set width(w) {
		this._width = w
		if (this.align === 'right') {
			this.g.attr("transform", "translate(" + this._width + ",0)")
		}
	}

	update(domain) {
		this.yScale.domain(domain)
		this.g.call(this.yAxis)
	}
}


class Chart {
	constructor(opts) {
		// 继承自 ChartSet
		this.xScale = opts.xScale // d3.line()
		this.chartDm = opts.chartDm

		this.parentG = opts.parentG
		this.name = opts.name
		this.g = new SVG_G({
			parentG: opts.parentG,
			name: this.name,
			top: opts.top,
			left: opts.top
		})

		// init yAxisLeft , yAxisRight
		// this.yAxisLeft = new ChartYAxis({
		//   parentG: this.g,
		//   align: 'left',
		//   height: this._height,
		//   width: this._width
		// })
		this.yAxisRight = null


		// Plots
		this.plots = {}

		// type 主图类型 'candle' 'ohlc' 'hollowCandle' 'day'
		// type 指标/副图类型 'line' 'bar' 'colorBar' 'dot'
	}

	top(t) {
		if (t) {
			this.g.top = t
		}
		return this.g.top
	}

	left(l) {
		if (l) {
			this.g.left = l
		}
		return this.g.left
	}

	get height() {
		return this.g.height
	}

	set height(h) {
		this.g.height = h

		this.yAxisLeft.height = h
		if (this.yAxisRight) this.yAxisRight.height = h
	}

	get width() {
		return this._width
	}

	set width(w) {
		this._width = w
		this.g.attr("width", this._width)
		this.yAxisLeft.width = w
		if (this.yAxisRight) this.yAxisRight.width = w
	}

	addPlot(plotOptions = {}) {
		this.plots[plotOptions.id] = new Plot(plotOptions)
		this.appendPlotTypePath(plotOptions.id, this.plots.paths)
	}

	appendPlotTypePath(id, classesList) {
		this.g.selectAll(`path.${id}`)
			.data(classesList)
			.enter()
			.append('path')
			.attr('class', (d) => `${id} ${d.join(' ')}`)
	}


	showPlot(id, show = true) {

	}

	removePlot(id) {
		this.plots[id].destroy()
		delete this.plots[id]
	}

	draw(l, r) {
		// 计算 Y 轴值范围
		let range = {
			left: [Infinity, -Infinity],
			right: [Infinity, -Infinity]
		}
		for (let id in this.plots) {
			let plot = this.plots[id]
			plot.update(l, r)
			let r = plot.range(l, r)
			range[plot.yAxisPos][0] = Math.min(r[0], range[plot.yAxisPos][0])
			range[plot.yAxisPos][1] = Math.max(r[1], range[plot.yAxisPos][1])
		}
		// 更新 Y 轴
		this.yAxisLeft.update(range.left)
		if (this.yAxisRight) this.yAxisRight.update(range.right)

		for (let key in this.plots) {
			let plot = this.plots[key]
			plot.draw(l, r)
		}
	}

}

class ChartSet {
	static ZOOM_SENSITIVITY = 3
	static INNER_HEIGHT_MIN = 50 // 最小高度
	static INNER_WIDTH_MIN = 80 // 最小高度

	constructor(opts) {
		this.divDomId = opts.id
		this.outerWidth = opts.width
		this.outerHeight = opts.height
		this.margin = opts.margin ? opts.margin : {top: 10, right: 50, bottom: 30, left: 50}
		this.innerWidth = this.outerWidth - this.margin.left - this.margin.right
		this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom
		this._symbol = opts.symbol ? opts.symbol : ''
		this._duration = opts.duration ? opts.duration : ''

		this.chartDm = new ChartDM({
			dm: opts.dm,
			ws: opts.ws,
			symbol: opts.instrumentId,
			duration: opts.duration,
			width: this.innerWidth
		})
		this.chartDm.addEventListener('update', this.draw.bind(this))

		// 主图类型 'candle' 'ohlc' 'hollowCandle' 'day'
		// this.mainChart = new Chart({
		//   type: this.mainPlotType,
		// })

		// this.charts = {
		//   'main' : new Candle()
		// }

		// mainPlotType: 'candle', // 'ohlc' 'hollowCandle'

		this.indicators = {}

		this.init()
		this.plotsManager = new PlotsManager(2, this.innerHeight, this.innerWidth)
		this.mainPlot = new Plot({
			name: 'candle',
			type: 'candle',
			xScale: this.xScale,
			chartDm: this.chartDm,
			parentG: this.rootG,

			width: this.innerWidth,
			height: this.plotsManager.positions[0].height,
			top: this.plotsManager.positions[0].top,
			left: 0
		})

		this.subPlots = {
			volume: new Plot({
				name: 'volume',
				type: 'volume',
				xScale: this.xScale,
				chartDm: this.chartDm,
				parentG: this.rootG,

				width: this.innerWidth,
				height: this.plotsManager.positions[1].height,
				top: this.plotsManager.positions[1].top,
				left: 0,
			}),
			oi: new Plot({
				name: 'oi',
				type: 'oi',
				xScale: this.xScale,
				chartDm: this.chartDm,
				parentG: this.rootG,

				yAxisPos: 'right',
				width: this.innerWidth,
				height: this.plotsManager.positions[1].height,
				top: this.plotsManager.positions[1].top,
				left: 0
			})
		}
	}

	init() {
		// 初始化 svg
		this.svg = d3.select("#" + this.divDomId).append("svg")
			.attr("width", this.outerWidth)
			.attr("height", this.outerHeight)

		// 根结点
		this.rootG = this.svg.append('g')
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

		// 加载中
		this.loading = new Loading({
			parentG: this.svg,
			name: 'loading',
			show: true
		})

		// 初始化 X 轴
		this.xScale = d3.scaleLinear()
		this.xAxis = d3.axisBottom().scale(this.xScale)
		this.rootG.append('g')
			.attr("class", 'x axis')
			.attr("transform", "translate(" + this.chartDm.barWidth / 2 + "," + (this.innerHeight + 0.5) + ")")

		// crosshair
		this.crosshair = new Crosshair({
			parentG: this.svg,
			name: 'crosshair',
			width: this.innerWidth,
			height: this.innerHeight,
			left: this.margin.left,
			top: this.margin.top,
			chartDm: this.chartDm
		})

		// 处理拖动事件  使用 rootG 要设置长宽
		let initX = null;
		let that = this
		let dragOnMove = d3.drag()
			.on("start", function () {
				initX = d3.event.x
				that.crosshair.hide()
			}).on("drag", function () {
				let moves = Math.round((d3.event.x - initX) / that.chartDm.barWidth);
				if (Math.abs(moves) > 0) {
					initX = d3.event.x;
					that.move(moves) // 移动 moves 柱子
				}
			}).on("end", function () {
				initX = null
				that.crosshair.show()
			});

		this.svg.call(dragOnMove)

		// 处理缩放事件
		let deltaY = 0
		let zoom = d3.zoom()
			.on('zoom', function () {
				deltaY += d3.event.sourceEvent.deltaY
				if (Math.abs(deltaY) >= ChartSet.ZOOM_SENSITIVITY) {
					let _zoom = Math.round(Math.abs(deltaY) / ChartSet.ZOOM_SENSITIVITY)
					_zoom = deltaY > 0 ? _zoom : -_zoom
					that.debounce(that.zoom, 200).bind(that)(_zoom)
					deltaY = 0
				}
			})
		this.svg.call(zoom).on("dblclick.zoom", null)
	}

	get width() {
		return this.outerWidth
	}

	set width(w) {
		if (w < this.margin.left + this.margin.right + ChartSet.INNER_WIDTH_MIN) return
		this.outerWidth = w
		this.innerWidth = this.outerWidth - this.margin.left - this.margin.right
		this.svg.attr("width", this.outerWidth)

		this.chartDm.width = this.innerWidth
		// 图布局重新计算
		this.plotsManager.width = this.innerWidth
		// 图布局放置
		this.mainPlot.width = this.plotsManager.positions[0].width
		for (let sub in this.subPlots) {
			this.subPlots[sub].width = this.plotsManager.positions[1].width
		}
		// 鼠标交互层布局
		this.crosshair.width = this.innerWidth
		// 账户显示层布局

	}

	get height() {
		return this.outerHeight
	}

	set height(h) {
		if (h < this.margin.top + this.margin.bottom + ChartSet.INNER_HEIGHT_MIN) return
		this.outerHeight = h
		this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom
		this.svg.attr("height", this.outerHeight)

		// 图布局重新计算
		this.plotsManager.height = this.innerHeight
		// 图布局放置
		this.mainPlot.height = this.plotsManager.positions[0].height
		this.mainPlot.top = this.plotsManager.positions[0].top
		for (let sub in this.subPlots) {
			this.subPlots[sub].height = this.plotsManager.positions[1].height
			this.subPlots[sub].top = this.plotsManager.positions[1].top
		}
		// 鼠标交互层布局
		this.crosshair.height = this.innerHeight
		// 账户显示层布局
	}

	set symbol(s) {
		this.chartDm.symbol = s
		setTimeout(this.draw.bind(this), 0)
	}

	set duration(d) {
		this.chartDm.duration = d
		setTimeout(this.draw.bind(this), 0)
	}

	get symbol() {
		return this._symbol
	}

	get duration() {
		return this._duration
	}

	debounce(fn, delay) {
		// 维护一个 timer
		let timer = null

		return function () {
			// 通过 ‘this’ 和 ‘arguments’ 获取函数的作用域和变量
			let context = this
			let args = arguments
			clearTimeout(timer)
			timer = setTimeout(function () {
				fn.apply(context, args)
			}, delay)
		}
	}

	addIndicator(opts) {
		let id = opts.id
		this.indicators[id] = opts

		switch (opts.name) {
			case 'ma':
				this.indicators[id].calculator = new MA(opts)
				break
			case 'boll':
				this.indicators[id].calculator = new BOLL(opts)
				break
		}
		this.mainPlot.addIndicator(this.indicators[id])
	}

	showIndicator(opts) {
		this.mainPlot.showIndicator(opts.id, opts.show)
	}

	move(moves) { // moves 正数右移 负数左移 moves 根柱子
		this.chartDm.moves(moves)
		this.draw()
	}

	zoom(n) { // n 正数放大/负数缩小 n 根柱子
		let oldBarWidth = this.chartDm.barWidth
		this.chartDm.barWidth -= n
		if (oldBarWidth !== this.chartDm.barWidth) {
			this.draw()
		}
	}

	drawXAxis() {
		// X 轴数据范围
		this.xScale.domain([this.chartDm.left_id, this.chartDm.right_id])

		// X 轴位置
		this.xScale.rangeRound([0, this.chartDm.barNumbers * this.chartDm.barWidth - this.chartDm.barWidth])
		this.rootG.selectAll("g.x.axis")
			.attr("transform", "translate(" + (this.chartDm.barWidth / 2) + "," + (this.innerHeight + 0.5) + ")")

		let klines = this.chartDm.klines
		this.xAxis.tickFormat((x, i) => {
			console.log(x, i)
			return klines[x] && klines[x].datetime ? MultiFormat(klines[x].datetime / 1e6) : ''
		})
		this.rootG.selectAll("g.x.axis").call(this.xAxis)
	}

	draw() {
		console.log('draw', this.chartDm.left_id, this.chartDm.right_id)
		if (this.chartDm.left_id === -1 || this.chartDm.right_id === -1) return false
		if (this.loading.show) this.loading.show = false
		this.drawXAxis()
		this.mainPlot.draw()
		for (let sub in this.subPlots) {
			this.subPlots[sub].draw()
		}
	}
}

export default ChartSet
