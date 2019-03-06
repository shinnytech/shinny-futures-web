import {UpDownEqual, UpDownEqualKeys, ArrayJoin} from '../Utils'

class OhlcPlot {
	constructor(opts) {
		this.name = opts.name ? opts.name : (new Date().getTime())
		this.plot = opts.plot ? opts.plot : null
		this.chartDm = this.plot.chartDm
		this.types = ['line', 'body']
	}

	createPaths() {
		this.paths = []
		UpDownEqualKeys.forEach(k => this.paths.push([this.name, 'body', k].join('.')))
		return this.paths
	}

	calcPaths(left_id, right_id, data) {
		if (!this.plot.yScale || !this.plot.xScale || !this.chartDm) return
		let _path = {}
		this.paths.forEach(k => _path[k] = '')
		for (let i = left_id; i <= right_id; i++) {
			if (!data[i]) continue
			UpDownEqualKeys.forEach(key => {
				if (UpDownEqual[key](data[i])) {
					_path[[this.name, 'body', key].join('.')] += this.bodyPath(data[i], i)
				}
			})
		}
		return _path
	}

	bodyPath(d, id) {
		let o = this.plot.yScale(d.open)
		let c = this.plot.yScale(d.close)
		let h = this.plot.yScale(d.high)
		let l = this.plot.yScale(d.low)
		let x = this.plot.xScale(id)
		let xL = x + this.chartDm.barPadding
		let xC = x + this.chartDm.barWidth / 2
		let xR = x + this.chartDm.barWidth - this.chartDm.barPadding
		let path = `M ${xL} ${o} L ${xC} ${o}`
		path += `M ${xC} ${l} L ${xC} ${h}`
		path += `M ${xC} ${c} L ${xR} ${c}`
		return path
	}

}

export default OhlcPlot
