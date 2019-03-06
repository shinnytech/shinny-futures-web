import * as d3 from 'd3'
import Plot from "./Plot"

const ArrayJoin = (array, delimiter=' ') => {
	if (!array.length) return ''
	return array.join(delimiter)
}

class Chart {
	constructor(opts) {
		// 继承自 ChartSet
		this.xScale = opts.xScale // d3.line()
		this.chartDm = opts.chartDm

		// type 主图类型 'candle' 'ohlc' 'day'
		// type 指标/副图类型 'line' 'bar' 'colorBar' 'dot'
		this.type = opts.type

		this.parentG = opts.parentG
		this.name = opts.name
		this._height = opts.height
		this._width = opts.width
		this._top = opts.top ? opts.top : 0
		this._left =  opts.left ? opts.left : 0

		this.g = this.parentG
			.append('g')
			.attr('class', this.name)
			.attr("transform", "translate(" + this._left + "," + this._top + ")")

		// 初始化 Y 轴，默认右侧
		this.yAlign = opts.align === 'left' ? 'left' : 'right'
		this.initYAxis()

		// Plots
		this.plots = {}
	}

	initYAxis(){
		this.yScale = d3.scaleLinear().range([this._height, 0])
		if (this.yAlign === 'left') {
			this.yAxis = d3.axisLeft().scale(this.yScale)
		} else {
			this.yAxis = d3.axisRight().scale(this.yScale)
		}
		this.ySvg = this.g
			.append('g')
			.attr('class', 'y axis')
		if (this.yAlign === 'right') {
			this.ySvg.attr("transform", "translate(" + this._width + ",0)")
		}
	}
	updateYAxis(domain) {
		this.yScale.domain(domain)
		this.ySvg.call(this.yAxis)
	}

	top(t) {
		if (t) {
			this._top = t
			this.g.attr("transform", "translate(" + this._left + "," + this._top + ")")
		}
		return this._top
	}
	left(l) {
		if (l) {
			this._left = l
			this.g.attr("transform", "translate(" + this._left + "," + this._top + ")")
		}
		return this.g.left()
	}
	height (h) {
		if (h) {
			this._height = h
			this.g.attr("height", this._height)
			this.yScale.range([this._height, 0])
		}
		return this._height
	}
	width(w) {
		if (w) {
			this._width = w
			this.g.attr("width", this._width)
			if (this.yAlign === 'right') {
				this.ySvg.attr("transform", "translate(" + this._width + ",0)")
			}
		}
		return this._width
	}

	// classNames ['hij', 'foo']
	appendPlotTypePath(classNames) {
		if (!Array.isArray(classNames)) {
			classNames = classNames.split('.')
		}
		this.g.selectAll(`path.${ArrayJoin(classNames, '.')}`)
			.data(d => [d])
			.enter()
			.append('path')
			.attr('class', `${ArrayJoin(classNames, ' ')}`);
	}

	addPlot(plotOptions = {}) {
		this.plots[plotOptions.id] = new Plot({
			id: plotOptions.id,
			type: plotOptions.type,
			name: plotOptions.name,
			calculator: plotOptions.calculator,

			xScale: this.xScale,
			yScale: this.yScale,
			chartDm: this.chartDm,
		})
		this.plots[plotOptions.id].path && this.plots[plotOptions.id].path.createPaths().forEach( classNames => {
			this.appendPlotTypePath(classNames.split('.'))
		})
	}

	showPlot(id, isShow = true) {
		for (let k in this.plots) {
			if (k === id) {
				this.g.selectAll(`path.${k}`)
					.attr("visibility", isShow ? "visible" : "hidden")
			}
		}
	}

	removePlot(id) {
		this.plots[id].destroy()
		this.g.selectAll(`path.${id}`)
			.attr("visibility", "hidden")
		delete this.plots[id]
	}

	draw(l, r) {
		// 计算 Y 轴值范围
		let range = [Infinity, -Infinity]
		for (let id in this.plots) {
			let plot = this.plots[id]
			let this_plot_range = plot.range(l, r)
			range[0] = Math.min(this_plot_range[0], range[0])
			range[1] = Math.max(this_plot_range[1], range[1])
		}

		// 更新 Y 轴
		this.updateYAxis(range)

		// 更新图表
		for (let key in this.plots) {

			// 主图🈯️只更新当前类型
			if (key in ['candle','ohlc','day'] && key !== this.type) {
				continue
			}

			let plot = this.plots[key]
			let paths = plot.path.calcPaths(l, r, this.chartDm.klines)
			for (let key in paths) {
				this.g.select(`path.${key}`).attr('d', paths[key])
			}
		}
	}

}
export default Chart
