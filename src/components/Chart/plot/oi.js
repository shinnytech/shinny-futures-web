class Oi {
  constructor (opts){
    this.name = opts.name ? opts.name : (new Date().getTime())
    this.plot = opts.plot ? opts.plot : null
  }
  createPaths () {
    this.paths = ['oi']
    return this.paths
  }
  calcPaths (left_id, right_id, data) {
    if (!this.plot.yScale || !this.plot.xScale || !this.plot.barWidth || !this.plot.barPadding) return
    let _path = ''
    for (let i = left_id; i<= right_id && data[i]; i++) {
      let oi = this.plot.yScale(data[i].close_oi)
      let x = this.plot.xScale(i) + this.plot.barWidth / 2
      _path += i === left_id ? 'M' : 'L'
      _path += `${x} ${oi} `
    }
    return {oi: _path}
  }
}

export default Oi
