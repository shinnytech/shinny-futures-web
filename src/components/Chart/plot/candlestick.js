import Plot from './plot'

const UpDownEqual = Plot.UpDownEqual()

class CandlePlot extends Plot {
  constructor (opts){
    super(opts)
    this.types = ['line', 'body']
    this.init()
  }

  init(){
    this.types.forEach(type => {
      Object.keys(UpDownEqual).forEach(key => {
        this.appendPlotTypePath([this.name, type, key]);
      })
    })
  }



  bodyPath (d, id){
    let o = this.yScale(d.open)
    let c = this.yScale(d.close)
    let x = this.xScale(id)  + this.barPadding
    let width = this.barWidth - this.barPadding * 2
    let path = `M ${x} ${o} l ${width} ${0}`
    if(o !== c) {
      path += ` L ${x + width} ${c} l ${-width} ${0} L ${x} ${o}`;
    }
    return path
  }

  linePath (d, id){
    let h = this.yScale(d.high)
    let l = this.yScale(d.low)
    let x = this.xScale(id) + this.barWidth / 2
    let path = `M ${x} ${h} L ${x} ${l}`
    return path
  }

  redraw(left_id, right_id) {
    let _path = {'body': {}, 'line': {}}
    this.types.forEach(type => {
      Object.keys(UpDownEqual).forEach(key => {
        _path[type][key] = ''
      })
    })
    let [min, max] = this.getYPriceRange(left_id, right_id)
    this.yScale.domain([min, max])
    this.g.selectAll("g.y.axis").call(this.yAxis)

    for (let i = left_id; i<= right_id; i++) {
      let d = this.data[i]
      Object.keys(UpDownEqual).forEach(key => {
        if (UpDownEqual[key](d)) {
          this.types.forEach(type => {
            _path[type][key] += this[type + 'Path'](d, i)
          })
        }
      })
    }

    this.types.forEach(type => {
      Object.keys(UpDownEqual).forEach(key => {
        this.g.select(`path.${Plot.ArrayJoin([this.name, type, key], '.')}`).attr('d', _path[type][key])
      })
    })
  }

}

export default CandlePlot
