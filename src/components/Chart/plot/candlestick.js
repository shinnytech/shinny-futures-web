import {UpDownEqual, UpDownEqualKeys} from '../Utils'

class Candle {
	constructor(opts) {
		this.name = opts.name ? opts.name : (new Date().getTime())
		this.plot = opts.plot ? opts.plot : null
		this.chartDm = this.plot.chartDm
		this.types = ['line', 'body']
	}

	createPaths() {
		this.paths = []
		UpDownEqualKeys.forEach(k => this.paths.push([this.name, 'line', k].join('.')))
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
					_path[[this.name, 'line', key].join('.')] += this.linePath(data[i], i)
				}
			})
		}
		return _path
	}

	bodyPath(d, id) {
		let o = Math.round(this.plot.yScale(d.open))
		let c = Math.round(this.plot.yScale(d.close))
		let x = this.plot.xScale(id) + this.chartDm.barPadding
		let width = this.chartDm.barWidth - this.chartDm.barPadding * 2
		let path = ''
		if (d.open !== d.close) {
			path = `M ${x} ${o} L ${x + width} ${o} L ${x + width} ${c} L ${x} ${c} L ${x} ${o}`;
		} else {
			path = `M ${x} ${o + 0.5} L ${x + width} ${o + 0.5}`;
		}
		return path
	}

	linePath(d, id) {
		let h = Math.round(this.plot.yScale(d.high))
		let l = Math.round(this.plot.yScale(d.low))
		let x = this.plot.xScale(id) + this.chartDm.barWidth / 2
		let path = `M ${x} ${h} L ${x} ${l}`
		return path
	}
}


export default Candle
