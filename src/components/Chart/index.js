import * as d3 from 'd3'
import ChartDM from './ChartDataManager'
import Chart from './Chart'

import Loading from './plot/loading'
import Crosshair from './plot/crosshair'

import MA from './indicator/ma'
import BOLL from './indicator/boll'

const ZOOM_SENSITIVITY = 3
const INNER_HEIGHT_MIN = 50 // 最小高度
const INNER_WIDTH_MIN = 80 // 最小高度

import { MultiFormat } from './Utils'

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

class ChartSet {

	constructor(opts) {
		this.divDomId = opts.id
		this.outerWidth = opts.width
		this.outerHeight = opts.height
		this.margin = opts.margin ? opts.margin : {top: 10, right: 50, bottom: 30, left: 50}
		this.innerWidth = this.outerWidth - this.margin.left - this.margin.right
		this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom

		this._symbol = opts.symbol ? opts.symbol : (opts.instrumentId ? opts.instrumentId : '')
		this._duration = opts.duration ? opts.duration : ''

		this.chartDm = new ChartDM({
			tqsdk: opts.tqsdk,
			symbol: this._symbol,
			duration: this._duration,
			width: this.innerWidth
		})

		this.init()




		// 0 background
		// this.background = new Plot({
		// 	name: 'candle',
		// 	type: 'candle',
		// 	xScale: this.xScale,
		// 	chartDm: this.chartDm,
		// 	parentG: this.rootG,
		//
		// 	width: this.innerWidth,
		// 	height: this.plotsManager.positions[0].height,
		// 	top: this.plotsManager.positions[0].top,
		// 	left: 0
		// })
		// 1 主图类型 'candle' 'ohlc' 'hollowCandle' 'day'
		// 2 副图 s （指标）
		// 3 鼠标
		// 4 盘口面板
		// 5 坐标轴
		// 6 画图层

		this.indicators = {}

		this.plotsManager = new PlotsManager(2, this.innerHeight, this.innerWidth)

		this.mainChart = new Chart({
			xScale: this.xScale,
			chartDm: this.chartDm,
			type: 'candle',
			parentG: this.rootG,
			width: this.innerWidth,
			height: this.plotsManager.positions[0].height,
			top: this.plotsManager.positions[0].top,
			left: 0
		})

		this.mainChart.addPlot({
			id: 'candle',
			type: 'candle',
			name: 'candle'
		})

		this.mainChart.addPlot({
			id: 'ohlc',
			type: 'ohlc',
			name: 'ohlc'
		})

		this.mainChart.addPlot({
			id: 'day',
			type: 'day',
			name: 'day'
		})

		this.mainChart.showPlot('ohlc', false)
		this.mainChart.showPlot('day', false)

		this.subCharts = {
			volume: new Chart({
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
			oi: new Chart({
				name: 'oi',
				type: 'oi',
				xScale: this.xScale,
				chartDm: this.chartDm,
				parentG: this.rootG,
				align: 'left',
				width: this.innerWidth,
				height: this.plotsManager.positions[1].height,
				top: this.plotsManager.positions[1].top,
				left: 0
			})
		}


		this.subCharts['volume'].addPlot({
			id: 'volume',
			type: 'volume',
			name: 'volume'
		})

		this.subCharts['oi'].addPlot({
			id: 'oi',
			type: 'oi',
			name: 'oi'
		})
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
				if (Math.abs(deltaY) >= ZOOM_SENSITIVITY) {
					let _zoom = Math.round(Math.abs(deltaY) / ZOOM_SENSITIVITY)
					_zoom = deltaY > 0 ? _zoom : -_zoom
					that.debounce(that.zoom, 200).bind(that)(_zoom)
					deltaY = 0
				}
			})
		this.svg.call(zoom).on("dblclick.zoom", null)
	}

	update() {
		this.chartDm.update()
		this.draw()
	}

	width(w) {
		if (w === undefined) return this.outerWidth
		if (w < this.margin.left + this.margin.right + INNER_WIDTH_MIN) return this.outerWidth

		this.outerWidth = w
		this.innerWidth = this.outerWidth - this.margin.left - this.margin.right
		this.svg.attr("width", this.outerWidth)

		this.chartDm.width = this.innerWidth
		// 图布局重新计算
		this.plotsManager.width = this.innerWidth
		// 图布局放置
		this.mainChart.width(this.plotsManager.positions[0].width)
		for (let sub in this.subCharts) {
			this.subCharts[sub].width = this.plotsManager.positions[1].width
		}
		// 鼠标交互层布局
		this.crosshair.width(this.innerWidth)
		// 账户显示层布局
	}

	height(h) {
		if (h === undefined) return this.outerHeight
		if (h < this.margin.top + this.margin.bottom + INNER_HEIGHT_MIN) return
		this.outerHeight = h
		this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom
		this.svg.attr("height", this.outerHeight)

		// 图布局重新计算
		this.plotsManager.height = this.innerHeight
		// 图布局放置
		this.mainChart.height(this.plotsManager.positions[0].height)
		this.mainChart.top(this.plotsManager.positions[0].top)
		for (let sub in this.subCharts) {
			this.subCharts[sub].height(this.plotsManager.positions[1].height)
			this.subCharts[sub].top(this.plotsManager.positions[1].top)
		}
		// 鼠标交互层布局
		this.crosshair.height(this.innerHeight)
		// 账户显示层布局
	}

	symbol(s) {
		if (s === undefined) return this._symbol
		this._symbol = s
		this.chartDm.symbol = s
		setTimeout(this.draw.bind(this), 0)
	}

	duration(d) {
		if (d === undefined) return this._duration
		this._duration = d
		this.chartDm.duration = d
		setImmediate(this.draw.bind(this))
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
		this.mainChart.addPlot(this.indicators[id])
	}

	setMainChartType(type){
		this.mainChart.type = type
		if (type === 'day') {
			this._duration = 60 * 1e9
			this.chartDm.duration = 60 * 1e9
			setImmediate(this.draw.bind(this))
		}
	}

	showPlot(opts) {
		this.mainChart.showPlot(opts.id, opts.show)
	}

	move(moves) { // moves 正数右移 负数左移 moves 根柱子
		if (this.mainChart.type !== 'day') {
			this.chartDm.moves(moves)
			this.draw()
		}
	}

	zoom(n) { // n 正数放大/负数缩小 n 根柱子
		let oldBarWidth = this.chartDm.barWidth
		this.chartDm.barWidth -= n
		if (oldBarWidth !== this.chartDm.barWidth) {
			this.draw()
		}
	}

	drawXAxis() {
		// 调整 X 轴数据范围
		this.xScale.domain([this.chartDm.left_id, this.chartDm.right_id])

		// 调整 X 轴位置
		this.xScale.rangeRound([0, this.chartDm.barNumbers * this.chartDm.barWidth - this.chartDm.barWidth])
		this.rootG.selectAll("g.x.axis")
			.attr("transform", "translate(" + (this.chartDm.barWidth / 2) + "," + (this.innerHeight + 0.5) + ")")

		let klines = this.chartDm.klines
		this.xAxis.tickFormat((x, i) => {
			return klines[x] && klines[x].datetime ? MultiFormat(klines[x].datetime / 1e6) : ''
		})
		this.rootG.selectAll("g.x.axis").call(this.xAxis)
	}

	draw() {
		console.log('draw', this.chartDm.left_id, this.chartDm.right_id)

		if (this.chartDm.left_id === -1 || this.chartDm.right_id === -1) return false
		if (this.loading.show) this.loading.show = false
		this.drawXAxis()
		this.mainChart.draw(this.chartDm.left_id, this.chartDm.right_id)
		for (let sub in this.subCharts) {
			this.subCharts[sub].draw(this.chartDm.left_id, this.chartDm.right_id)
		}
	}
}

export default ChartSet
