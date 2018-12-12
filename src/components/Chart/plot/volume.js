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
  }
  createPaths () {
    this.paths = []
    Object.keys(UpDownEqual).forEach(k => this.paths.push([this.name, 'body', k].join('.')))
    return this.paths
  }
  calcPaths (left_id, right_id, data) {
    if (!this.plot.yScale || !this.plot.xScale || !this.plot.barWidth || !this.plot.barPadding) return
    let _path = {}
    this.paths.forEach(k => _path[k] = '')
    for (let i = left_id; i<= right_id && data[i]; i++) {
      Object.keys(UpDownEqual).forEach(key => {
        if (UpDownEqual[key](data[i])) {
          _path[[this.name, 'body', key].join('.')] += this.bodyPath(data[i], i)
        }
      })
    }
    return _path
  }
  bodyPath (d, id){
    let max = this.plot.yScale(0)
    let vol = max - this.plot.yScale(d.volume)
    let x = this.plot.xScale(id) + this.plot.barPadding
    let width = this.plot.barWidth - this.plot.barPadding * 2
    let path = `M ${x} ${max} l ${width} ${0} l ${0} ${-vol} l ${-width} ${0} l ${0} ${vol}`
    return path
  }
}

export default Volume
