const UpDownEqualFunc = function () {
  return {
    up : (d) => d.open <= d.close,
    down : (d) => d.open > d.close
  }
}

const UpDownEqual = UpDownEqualFunc()

class Volume {
  constructor (opts){
    this.name = opts.name ? opts.name : (new Date().getTime())
    this.plot = opts.plot ? opts.plot : null
    this.chartDm = this.plot.chartDm
  }
  createPaths () {
    this.paths = []
    Object.keys(UpDownEqual).forEach(k => this.paths.push([this.name, 'body', k].join('.')))
    return this.paths
  }
  calcPaths (left_id, right_id, data) {
    if (!this.plot.yScale || !this.plot.xScale || !this.chartDm) return
    let _path = {}
    this.paths.forEach(k => _path[k] = '')
    for (let i = left_id; i<= right_id; i++) {
      if (!data[i]) continue
      Object.keys(UpDownEqual).forEach(key => {
        if (UpDownEqual[key](data[i])) {
          _path[[this.name, 'body', key].join('.')] += this.bodyPath(data[i], i, key === 'up' ? 0 : 0.5)
        }
      })
    }
    return _path
  }
  bodyPath (d, id, diff){
    let max = Math.floor(this.plot.yScale(0))
    let vol = Math.round(max - this.plot.yScale(d.volume))
    let x = this.plot.xScale(id) + this.chartDm.barPadding
    let width = this.chartDm.barWidth - this.chartDm.barPadding * 2
    let path = `M ${x+diff} ${max-diff} L ${x+width-diff} ${max-diff} L ${x+width-diff} ${max-vol+diff} L ${x+diff} ${max-vol+diff} L ${x+diff} ${max-diff}`
    // let path = `M ${x} ${max} L ${x+width} ${max} L ${x+width} ${max-vol} L ${x} ${max-vol} L ${x} ${max}`
    return path
  }
}

export default Volume
