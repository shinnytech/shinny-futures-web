import * as d3 from 'd3'

import { MultiFormat} from '../Utils'

const FormatPrice = function (price_decs) {
	if (Number.isInteger(price_decs)) {
		return (d) => d && d.toFixed ? d.toFixed(price_decs) : d
	} else {
		return (d) => d
	}
}

const FormatDatetime = function (datetime) {
	let dt = null
	if (typeof datetime === 'number') {
		if (datetime > 1000000000000 && datetime < 3000000000000) {
			// 说明dt是介于 2001 - 2065 年之间的毫秒数
			dt = new Date(datetime)
		} else {
			dt = new Date(datetime / 1000000)
		}
		let YYYY = dt.getFullYear() + ''
		let MM = (dt.getMonth() + 1 + '').padStart(2, '0')
		let DD = (dt.getDate() + '').padStart(2, '0')
		let hh = (dt.getHours() + '').padStart(2, '0')
		let mm = (dt.getMinutes() + '').padStart(2, '0')
		let ss = (dt.getSeconds() + '').padStart(2, '0')
		let SSS = (dt.getMilliseconds() + '').padStart(3, '0')
		if (hh === '00' && mm === '00' && ss === '00'){
			return `${YYYY}/${MM}/${DD} (${dt.getDay()})`
		} else {
			return `${YYYY}/${MM}/${DD}-${hh}:${mm}:${ss}`
		}
	} else return dt
}


export default class Crosshair {
	constructor(opts) {
		this.parentG = opts.parentG
		this.name = opts.name
		this._top = opts.top ? opts.top : 0
		this._left = opts.left ? opts.left : 0
		this._height = opts.height ? opts.height : 0
		this._width = opts.width ? opts.width : 0

		this.chartDm = opts.chartDm

		// init svg
		this.g = this.parentG
			.append('g')
			.attr('class', this.name)
			.attr("transform", "translate(" + this._left + "," + this._top + ")")
			.attr("height", this._height)
			.attr("width", this._width)
		this._isShow = opts.show ? opts.show : true
		this.g.attr("visibility", this._isShow ? "visible" : "hidden")

		let _this = this
		this.g.selectAll("rect")  // For new circle, go through the update process
			.data([0])
			.enter()
			.append("rect")
			.attr("width", this._width)
			.attr("height", this._height)
			.attr("fill-opacity", 0)
			.on("mouseover", function () {
				_this.show()
			})
			.on("mousemove", function () {
				let [x, y] = d3.mouse(this)
				let xBarsNum = Math.floor(x / _this.chartDm.barWidth)
				let xAlign = xBarsNum * _this.chartDm.barWidth + _this.chartDm.barWidth / 2
				if (_this.chartDm.klines) {
					let data = _this.chartDm.klines[_this.chartDm.left_id + xBarsNum]
					if (data) {
						// K线说明
						let price_decs = _this.chartDm.quote.price_decs
						let formatter = FormatPrice(price_decs)
						let strs = [
							FormatDatetime(data.datetime),
							'高 ' + formatter(data.high),
							'开 ' + formatter(data.open),
							'低 ' + formatter(data.low),
							'收 ' + formatter(data.close),
						];
						let text = _this.g.selectAll("g.text text");

						let selections = text.selectAll("tspan")
							.data(strs)
						selections.exit().remove()
						selections.enter()
							.append('tspan')
							.merge(selections)
							.attr("x","-4em")
							.attr("dy","1em")
							.text(function(d){
								return d;
							});

						// axisannotation x y
						let annotation_x = _this.g.select("g.axisannotation.x text")
						let annotation_y = _this.g.select("g.axisannotation.y text")
						annotation_x.text(MultiFormat(data.datetime / 1e6))
						annotation_x.attr("x", xAlign)
							.attr("y", _this._height + 16)
						_this.g.select("g.axisannotation.x rect")
							.attr("x", xAlign)
							.attr("y", _this._height + 4)

						// annotation_y.text()
						// annotation_y.attr("x", _this._width)
						// 	.attr("y", _this._height)
					}

				}
				// 水平竖直线段
				let h = _this.g.select("g.crosshair.horizontal line")
				let v = _this.g.select("g.crosshair.vertical line")
				if (h.attr('y1') !== y) {
					h.attr('y1', y).attr('y2', y)
				}
				if (v.attr('x1') !== xAlign) {
					v.attr('x1', xAlign).attr('x2', xAlign)
				}
			})
			.on("mouseleave", function () {
				_this.hide()
			})

		this.g.append('g')
			.attr("class", 'crosshair horizontal')
			.append('line')
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", this._width)
			.attr("y2", 0)
			.attr("stroke", '#bbbbbb')
			.attr("stroke-dasharray", '2 4')
			.attr("visibility", "hidden")
		this.g.append('g')
			.attr("class", 'crosshair vertical')
			.append('line')
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", 0)
			.attr("y2", this._height)
			.attr("stroke", '#bbbbbb')
			.attr("stroke-dasharray", '2 4')
			.attr("visibility", "hidden")

		this.g.append('g')
			.attr("class", 'text')
			.append('text')
			.attr("fill", "grey")
			.attr("x", 0)
			.attr("y", 0)

		this.g.append('g')
			.attr('class', 'axisannotation x')

		this.g.select('g.axisannotation.x')
			.append('rect')
			.attr("fill", "#eeeeee")
			.attr("opacity", "0.8")
			.attr("width", "40px")
			.attr("height", "16px")

		this.g.select('g.axisannotation.x')
			.append('text')
			.attr("fill", "white")


		this.g.append('g')
			.attr('class', 'axisannotation y')
			.append('text')

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
		return this._left
	}

	height(h) {
		if (h) {
			this._height = h
			this.g.select("g.crosshair.vertical line")
				.attr('y2', h)
			this.g.select("rect")
				.attr("height", h)
		}
		return this._height
	}

	width(w) {
		if (w) {
			this._width = w
			this.g.select("g.crosshair.horizontal line")
				.attr('x2', w)
			this.g.select("rect")
				.attr("width", w)
		}
		return this._width
	}

	show(isShow = true) {
		this.g.selectAll("g.crosshair line")
			.attr("visibility", isShow ? "visible" : "hidden")
	}

	hide(isShow = false) {
		this.g.selectAll("g.crosshair line")
			.attr("visibility", isShow ? "visible" : "hidden")
	}

}
