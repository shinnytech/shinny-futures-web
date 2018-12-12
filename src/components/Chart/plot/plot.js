import * as d3 from 'd3'
import Candle from './candlestick'
import Volume from "./volume";
import Oi from "./oi";

class Plot {
  constructor (opts) {

    // this.left = opts.left
    this.name = opts.name
    this.type = opts.type
    this.xScale = opts.xScale // d3.line()
    // init yScale

    this.yScale = d3.scaleLinear().range([1, 0])
    if (opts.yAxisPos === 'right') {
      this.yAxis = d3.axisRight().scale(this.yScale)
    } else {
      this.yAxis = d3.axisLeft().scale(this.yScale)
    }

    this._top = opts.top
    this.barWidth = opts.barWidth
    this.barPadding = opts.barPadding
    this.width = opts.width
    this.height = opts.height

    this.parentG = opts.parentG
    this.g = this.parentG
      .append('g')
      .attr('class', this.name)
      .attr("transform", "translate(0," + this.top + ")")

    this.g.append("g").attr("class", "y axis")
    if (opts.yAxisPos === 'right') {
      this.g.select('g.y.axis')
        .attr("transform", "translate(" + (opts.width) + ",0)")
    }
       // .append("text")
       //     .attr("transform", "rotate(-90)")
       //     .attr("y", 6)
       //     .attr("dy", ".71em")
       //     .style("text-anchor", "end")
       // .text("Price");

    this.chartDm = opts.chartDm
    // this.type
    switch (this.type) {
      case 'candle':
        this.path = new Candle({
          name: this.name,
          plot: this
        })
        break
      case 'volume':
        this.path = new Volume({
          name: this.name,
          plot: this
        })
        break
      case 'oi':
        this.path = new Oi({
          name: this.name,
          plot: this
        })
        break
    }

    this.path.createPaths().forEach( classNames => {
      this.appendPlotTypePath(classNames.split('.'))
    })
  }
  get top(){
    return this._top
  }

  set top(t){
    this._top = t
    this.g.attr("transform", "translate(0," + this._top + ")")
  }

  get height() {
    return this._height
  }

  set height(h) {
    this._height = h
    this.yScale.range([h, 0])
  }

  get width() {
    return this._Width
  }

  set width(w) {
    this._Width = w
  }

  get barWidth() {
    return this._barWidth
  }

  set barWidth(w) {
    this._barWidth = w
  }

  get barPadding() {
    return this._barPadding
  }

  set barPadding(w) {
    this._barPadding = w
  }

  appendPathsGroupBy (classes) {
    Object.keys(classes).forEach(key => {
      this.appendPlotTypePath([this.name, key]);
    })
  }

  appendPlotTypePath(classNames) {
    this.g.selectAll(`path.${Plot.ArrayJoin(classNames, '.')}`)
      .data(d => [d])
      .enter()
      .append('path')
      .attr('class', `${Plot.ArrayJoin(classNames, ' ')}`);
  }


  getYPriceRange (left_id, right_id, center = null) {
    let min = Infinity, max = -Infinity
    if (center) {
      let dis = 0
      for (let i = left_id; i<= right_id; i++) {
        let d = this.chartDm.klines.data[i]
        dis = Math.max(Math.abs(d.high - center), Math.abs(d.low - center), dis)
      }
      min = center - dis
      max = center + dis
    } else {
      for (let i = left_id; i<= right_id; i++) {
        let d = this.chartDm.klines.data[i]
        if (d) {
          min = Math.min(min, d.low)
          max = Math.max(max, d.high)
        }
      }
      if (this.chartDm.quote && this.chartDm.quote.price_tick) {
        let padding = 5 * this.chartDm.quote.price_tick
        min -= padding
        max += padding
      }
    }
    return [min, max]
  }

  getYMaxRange(left_id, right_id, key){
    let max = -Infinity
    for (let i = left_id; i<= right_id; i++) {
      let d = this.chartDm.klines.data[i]
      if (d) {
        max = Math.max(max, d[key])
      }
    }
    return max
  }

  getYMinRange(left_id, right_id, key){
    let min = Infinity
    for (let i = left_id; i<= right_id; i++) {
      let d = this.chartDm.klines.data[i]
      if (d) {
        min = Math.min(min, d[key])
      }
    }
    return min
  }

  draw () {
    let yDomain = null
    switch (this.type) {
      case 'candle':
        yDomain = this.getYPriceRange(this.chartDm.left_id, this.chartDm.right_id)
        break
      case 'volume':
        yDomain = [0, this.getYMaxRange(this.chartDm.left_id, this.chartDm.right_id, 'volume')]
        break
      case 'oi':
        yDomain = [this.getYMinRange(this.chartDm.left_id, this.chartDm.right_id, 'close_oi'), this.getYMaxRange(this.chartDm.left_id, this.chartDm.right_id, 'close_oi')]
        break
    }

    this.yScale.domain(yDomain)
    this.g.selectAll("g.y.axis").call(this.yAxis)

    let paths = this.path.calcPaths(this.chartDm.left_id, this.chartDm.right_id, this.chartDm.klines.data)
    for (let key in paths) {
      this.g.select(`path.${key}`).attr('d', paths[key])
    }
  }


  static ArrayJoin (array, delimiter=' ') {
    if (!array.length) return ''
    return array.join(delimiter)
  }

  static UpDownEqual() {
    return {
      up : (d) => d.open < d.close,
      down : (d) => d.open > d.close,
      equal : (d) => d.open === d.close
    }
  }
}

export default Plot
