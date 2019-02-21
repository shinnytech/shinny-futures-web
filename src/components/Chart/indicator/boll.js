import {MA, STDEV} from './basefunc'

class BOLL {
	constructor(opts = {}) {
		this.n = opts.pramas && opts.pramas.n ? opts.pramas.n : 10
		this.p = opts.pramas && opts.pramas.p ? opts.pramas.p : 3
		this.paths = [{
			name: 'top',
			type: 'line'
		}, {
			name: 'bottom',
			type: 'line'
		}]

		this._mid = []
		this._std = []
		this.top = []
		this.bottom = []
	}

	calc(l, r, klines) {
		for (let i = l; i <= r; i++) {
			if (this.top[i] && this.bottom[i]) continue
			this._mid[i] = MA(i, klines.close, this.n, this._mid)
			this._std[i] = STDEV(i, klines.close, this.n, this._std)
			this.top[i] = this._mid[i] + this.p * this._std[i]
			this.bottom[i] = this._mid[i] - this.p * this._std[i]
		}
		return {
			top: this.top,
			bottom: this.bottom
		}
	}

	range(l, r) {
		let min = NaN
		let max = NaN
		for (let i = l; i <= r; i++) {
			if (this.top[i] && this.bottom[i]) {
				max = max ? Math.max(max, this.top[i]) : this.top[i]
				min = min ? Math.min(min, this.bottom[i]) : this.bottom[i]
			}
		}
		return [min, max]
	}
}

export default BOLL
