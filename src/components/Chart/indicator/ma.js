import { MA as ma_func} from './basefunc'

class MA {
  constructor (opts = {}){
    this.params = opts.params ? opts.params : 5

    this.paths = [{
      name: 'ma',
      type: 'line'
    }]
    this.ma = []
  }
  calc(l, r, klines){
    for(let i = l; i <= r; i++) {
      if (this.ma[i]) continue
      this.ma[i] = ma_func(i, klines.close, this.params, this.ma)
    }
    return this.ma
  }
  range(l, r){
    let min = NaN
    let max = NaN
    for(let i = l; i <= r; i++) {
      if (this.ma[i]) {
        max = max ? Math.max(max, this.ma[i]) : this.ma[i]
        min = min ? Math.min(min, this.ma[i]) : this.ma[i]
      }
    }
    return [min, max]
  }
}

export default MA
