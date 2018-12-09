import * as d3 from 'd3'

class Plot {
  constructor (opts) {
    this.barWidth = opts.barWidth
    this.barPadding = opts.barPadding
    this.width = opts.width
    this.height = opts.height
    this.top = opts.top
    this.left = opts.left
    this.name = opts.name
    this.parentG = opts.parentG
    this.g = this.parentG
      .append('g')
      .attr('class', this.name);

    this.g.append("g").attr("class", "y axis")
       // .append("text")
       //     .attr("transform", "rotate(-90)")
       //     .attr("y", 6)
       //     .attr("dy", ".71em")
       //     .style("text-anchor", "end")
       // .text("Price");

    this.xScale = opts.xScale // d3.line()
    this.yScale = d3.scaleLinear().range([this.height, 0])
    this.yAxis = d3.axisLeft().scale(this.yScale)
    this.quote = opts.quote
  }

  setHeight(h) {
    this.height = h
    this.yScale.range([this.height, 0])
  }

  setQuote(quote){
    this.quote = quote
  }

  setData(data){
    this.klines = data
    this.data = data.data
  }

  setBarWidth(barWidth, barPadding){
    this.barWidth = barWidth
    this.barPadding = barPadding
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
        let d = this.data[i]
        dis = Math.max(Math.abs(d.high - center), Math.abs(d.low - center), dis)
      }
      min = center - dis
      max = center + dis
    } else {
      for (let i = left_id; i<= right_id; i++) {
        let d = this.data[i]
        min = Math.min(min, d.low)
        max = Math.max(max, d.high)
      }

      if (this.quote && this.quote.price_tick) {
        let padding = 5 * this.quote.price_tick
        min -= padding
        max += padding
      }
    }
    return [min, max]
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
