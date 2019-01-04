
// type [candle, dot, line, bar, colorBar]
const UpDown = {
  up: (d) => d.open <= d.close,
  down: (d) => d.open > d.close,
}

const UpDownEqual = {
  up: (d) => d.open < d.close,
  down: (d) => d.open > d.close,
  equal: (d) => d.open === d.close
}

class Indicator {
  static HollowBarDiff = 0.5
  constructor (opts = {}){
    // 计算器
    this.calculator = opts.calculator // new CalculatorBoll() // opts.calculator

    this.name = opts.name ? opts.name : (new Date().getTime())
    this.plot = opts.plot ? opts.plot : null
    this.chartDm = this.plot.chartDm

    this.pathClasses = []

    this.type = 'MAIN' // MAIN SUB
  }

  createPaths () {
    for(let i = 0; i < this.calculator.paths.length; i++) {
      let pathName = this.calculator.paths[i].name
      let pathType = this.calculator.paths[i].type
      if (pathType === 'colorBar') {
        Object.keys(UpDown).forEach(k => {
          this.pathClasses.push([this.name, pathName, k].join('.'))
        })
      } else if (pathType === 'candle') {
        ['line', 'body'].forEach(k1 => {
          Object.keys(UpDownEqual).forEach(k2 => {
            this.pathClasses.push([this.name, pathName, k1, k2].join('.'))
          })
        })
      } else {
        this.pathClasses.push([this.name, pathName].join('.'))
      }
    }
    return this.pathClasses
  }

  calcPaths (left_id, right_id, data) {
    if (!this.plot.yScale || !this.plot.xScale || !this.chartDm) return
    let paths = {}
    this.pathClasses.forEach(k => paths[k] = '')
    for (let i = 0; i<this.calculator.paths.length; i++) {
      let pathName = this.calculator.paths[i].name
      let pathClasses = this.name + '.' +this.calculator.paths[i].name
      let pathType = this.calculator.paths[i].type
      if (pathType === 'line') {
        for (let i = left_id; i<= right_id; i++) {
          if (!this.calculator[pathName][i]) continue
          let path = this.linePath(this.calculator[pathName][i], i)
          paths[pathClasses] += paths[pathClasses] === '' ? `M ${path}` : `L ${path}`
        }
      } else if (pathType === 'bar') {
        let max = this.plot.yScale(0)
        for (let i = left_id; i<= right_id; i++) {
          if (!this.calculator[pathName][i]) continue
          let path = this.linePath(this.calculator[pathName][i], max, i)
          paths[pathClasses] += path
        }
      } else if (pathType === 'colorBar') {
        let max = this.plot.yScale(0)
        for (let i = left_id; i<= right_id; i++) {
          if (!this.calculator[pathName][i]) continue
          Object.keys(UpDown).forEach(k => {
            if (k(this.chartDm.klines.data[i])){
              let path = this.linePath(this.calculator[pathName][i], max, i, k === 'down' ? Indicator.HollowBarDiff : 0)
              paths[pathClasses + '.' + k] += path
            }
          })

        }
      }
    }
    return paths
  }

  linePath(val, id){
    let y = this.plot.yScale(val)
    let x = this.plot.xScale(id) + this.chartDm.barWidth / 2
    return `${x} ${y}`
  }

  // hollowBar => diff = 0.5 ; solidBar => diff = 0 ;
  barPath(val, max, id, diff = 0){
    let y = Math.round(max - this.plot.yScale(val))
    let x = Math.round(this.plot.xScale(id) + this.chartDm.barPadding)
    let width = this.chartDm.barWidth - this.chartDm.barPadding * 2
    return `M ${x+diff} ${max} L ${x+width-diff} ${max} L ${x+width-diff} ${max-y} L ${x+diff} ${max-y} L ${x+diff} ${max}`
  }

}

export default Indicator
