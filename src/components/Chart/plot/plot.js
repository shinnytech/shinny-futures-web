import * as d3 from 'd3'
import Candle from './candlestick'
import Volume from "./volume";
import Oi from "./oi";

import Indicator from '../indicator/indicator'
import SVG_G from './svg_g'


class Plot_SVG_G extends SVG_G{
  constructor (opts) {
    super(opts)
    this.xScale = opts.xScale // d3.line()
    this.chartDm = opts.chartDm
    // init yScale
    this.yScale = d3.scaleLinear().range([opts.height, 0])
    this.yAxisLeft = d3.axisLeft().scale(this.yScale)
    this.yAxisRight = d3.axisRight().scale(this.yScale)
    this.g.append("g")
      .attr("class", "y axis left")
    this.g.append("g")
      .attr("class", "y axis right")
      .attr("transform", "translate(" + opts.width + ",0)")
    // paths
    this.paths = {}
  }

  set height(h) {
    super.height = h
    this.yScale.range([h, 0])
  }

  set width(w) {
    super.width = w
    this.g.select('g.y.axis.right')
      .attr("transform", "translate(" + w + ",0)")
  }

  addPaths(){

  }

  removePaths(){

  }


  init () {
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

    this.path && this.path.createPaths().forEach( classNames => {
      this.appendPlotTypePath(classNames.split('.'))
    })
    this.indicators = {}
  }

  addIndicator (opts) {
    switch (opts.name) {
      case "ma":
        this.indicators[opts.id] = new Indicator({
          calculator: opts.calculator,
          name: opts.id,
          plot: this
        })
        break
      case "boll":
        this.indicators[opts.id] = new Indicator({
          calculator: opts.calculator,
          name: opts.id,
          plot: this
        })
        break
    }

    this.indicators[opts.id] && this.indicators[opts.id].createPaths().forEach(classNames => {
      classNames = opts.id + '.' + classNames
      this.appendPlotTypePath(classNames.split('.'))
    })
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
        let d = this.chartDm.klines[i]
        dis = Math.max(Math.abs(d.high - center), Math.abs(d.low - center), dis)
      }
      min = center - dis
      max = center + dis
    } else {
      for (let i = left_id; i<= right_id; i++) {
        let d = this.chartDm.klines[i]
        if (d) {
          min = Math.min(min, d.low)
          max = Math.max(max, d.high)
        }
      }

      if (this.chartDm.quote && this.chartDm.quote.price_tick) {
        let padding = 20 * this.chartDm.quote.price_tick
        min -= padding
        max += padding
      }
    }
    return [min, max]
  }

  getYMaxRange(left_id, right_id, key){
    let max = -Infinity
    for (let i = left_id; i<= right_id; i++) {
      let d = this.chartDm.klines[i]
      if (d) {
        max = Math.max(max, d[key])
      }
    }
    return max
  }

  getYMinRange(left_id, right_id, key){
    let min = Infinity
    for (let i = left_id; i<= right_id; i++) {
      let d = this.chartDm.klines[i]
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

    let paths = this.path.calcPaths(this.chartDm.left_id, this.chartDm.right_id, this.chartDm.klines)

    for (let key in paths) {
      this.g.select(`path.${key}`).attr('d', paths[key])
    }

    for (let k in this.indicators) {
      this.indicators[k].calculator.calc(this.chartDm.left_id, this.chartDm.right_id, this.chartDm.klines)
    }

    for (let k in this.indicators) {
      let paths = this.indicators[k].calcPaths(this.chartDm.left_id, this.chartDm.right_id, this.chartDm.klines)
      for (let key in paths) {
        this.g.select(`path.${k}.${key}`).attr('d', paths[key])
      }
    }
  }

  showIndicator (name, isShow = true) {
    for (let k in this.indicators) {
      if (k === name) {
        this.g.selectAll(`path.${k}`)
          .attr("visibility", isShow ? "visible" : "hidden")
      }
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



class Plot extends SVG_G{
  constructor (opts) {
    super(opts)
    this.type = opts.type
    this.xScale = opts.xScale // d3.line()
    this.chartDm = opts.chartDm
    // init yScale
    this.yScale = d3.scaleLinear().range([opts.height, 0])
    this.yAxis = opts.yAxisPos === 'right' ? d3.axisRight().scale(this.yScale) : this.yAxis = d3.axisLeft().scale(this.yScale)

    this.g.append("g").attr("class", "y axis " + (opts.yAxisPos === 'right' ? 'right' : ''))
    if (opts.yAxisPos === 'right') {
      this.g.select('g.y.axis.right')
        .attr("transform", "translate(" + opts.width + ",0)")
    }
    this.init()
  }

  init () {
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

    this.path && this.path.createPaths().forEach( classNames => {
      this.appendPlotTypePath(classNames.split('.'))
    })
    this.indicators = {}
  }

  addIndicator (opts) {
    switch (opts.name) {
      case "ma":
        this.indicators[opts.id] = new Indicator({
          calculator: opts.calculator,
          name: opts.id,
          plot: this
        })
        break
      case "boll":
        this.indicators[opts.id] = new Indicator({
          calculator: opts.calculator,
          name: opts.id,
          plot: this
        })
        break
    }

    this.indicators[opts.id] && this.indicators[opts.id].createPaths().forEach(classNames => {
      classNames = opts.id + '.' + classNames
      this.appendPlotTypePath(classNames.split('.'))
    })
  }

  set height(h) {
    super.height = h
    this.yScale.range([h, 0])
  }

  set width(w) {
    super.width = w
    this.g.select('g.y.axis.right')
      .attr("transform", "translate(" + w + ",0)")
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
        let d = this.chartDm.klines[i]
        dis = Math.max(Math.abs(d.high - center), Math.abs(d.low - center), dis)
      }
      min = center - dis
      max = center + dis
    } else {
      for (let i = left_id; i<= right_id; i++) {
        let d = this.chartDm.klines[i]
        if (d) {
          min = Math.min(min, d.low)
          max = Math.max(max, d.high)
        }
      }

      if (this.chartDm.quote && this.chartDm.quote.price_tick) {
        let padding = 20 * this.chartDm.quote.price_tick
        min -= padding
        max += padding
      }
    }
    return [min, max]
  }

  getYMaxRange(left_id, right_id, key){
    let max = -Infinity
    for (let i = left_id; i<= right_id; i++) {
      let d = this.chartDm.klines[i]
      if (d) {
        max = Math.max(max, d[key])
      }
    }
    return max
  }

  getYMinRange(left_id, right_id, key){
    let min = Infinity
    for (let i = left_id; i<= right_id; i++) {
      let d = this.chartDm.klines[i]
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

    let paths = this.path.calcPaths(this.chartDm.left_id, this.chartDm.right_id, this.chartDm.klines)

    for (let key in paths) {
      this.g.select(`path.${key}`).attr('d', paths[key])
    }

    for (let k in this.indicators) {
      this.indicators[k].calculator.calc(this.chartDm.left_id, this.chartDm.right_id, this.chartDm.klines)
    }

    for (let k in this.indicators) {
      let paths = this.indicators[k].calcPaths(this.chartDm.left_id, this.chartDm.right_id, this.chartDm.klines)
      for (let key in paths) {
        this.g.select(`path.${k}.${key}`).attr('d', paths[key])
      }
    }
  }

  showIndicator (name, isShow = true) {
    for (let k in this.indicators) {
      if (k === name) {
        this.g.selectAll(`path.${k}`)
          .attr("visibility", isShow ? "visible" : "hidden")
      }
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
