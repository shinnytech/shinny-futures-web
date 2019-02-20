import * as d3 from 'd3'
import SVG_G from './svg_g'

export default class Crosshair extends SVG_G{
  constructor (opts) {
    super(opts)
    this.chartDm = opts.chartDm

    let _this = this
    this.g.selectAll("rect")  // For new circle, go through the update process
      .data([0])
      .enter()
      .append("rect")
      .attr("width", super.width)
      .attr("height", super.height)
      .attr("fill-opacity", 0)
      .on("mouseover", function(){
        _this.show()
      })
      .on("mousemove", function(){
        let [x, y] = d3.mouse(this)
        let xBarsNum = Math.floor(x / _this.chartDm.barWidth)
        let xAlign = xBarsNum * _this.chartDm.barWidth + _this.chartDm.barWidth / 2
        if (_this.chartDm.klines && _this.chartDm.klines.data) {
          let data = _this.chartDm.klines.data[_this.chartDm.left_id + xBarsNum]
          if (!data) {
            data = {
              high: '',
              open: '',
              low: '',
              close: ''
            }
          }
          let showText = `高 ${data.high} 开 ${data.open} 低 ${data.low} 收 ${data.close}`
          _this.g.select("g.text text")
            .text(showText)
        }
        let h = _this.g.select("g.crosshair.horizontal line")
        let v = _this.g.select("g.crosshair.vertical line")
        if (h.attr('y1') !== y) {
          h.attr('y1', y).attr('y2', y)
        }
        if (v.attr('x1') !== xAlign){
          v.attr('x1', xAlign).attr('x2', xAlign)
        }
      })
      .on("mouseleave", function(){
        _this.hide()
      })

    this.g.append('g')
      .attr("class", 'crosshair horizontal')
      .append('line')
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", super.width)
      .attr("y2", 0)
      .attr("stroke", '#bbbbbb')
      .attr("stroke-dasharray", '2 4')
      .attr("visibility", "hidden")
    this.g.append('g')
      .attr("class", 'crosshair vertical')
      .append('line')
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", super.height)
      .attr("stroke", '#bbbbbb')
      .attr("stroke-dasharray", '2 4')
      .attr("visibility", "hidden")

    this.g.append('g')
      .attr("class", 'text')
      .append('text')
      .attr("fill", "grey")
      .attr("x", 0)
      .attr("y", 0)

    this.g.append('g')
      .attr('class', 'axisannotation x')
    this.g.append('g')
      .attr('class', 'axisannotation y')
  }

  set height (h) {
    super.height = h
    this.g.select("g.crosshair.vertical line")
      .attr('y2', h)
    this.g.select("rect")
      .attr("height", h)
  }

  set width (w) {
    super.width = w
    this.g.select("g.crosshair.horizontal line")
      .attr('x2', w)
    this.g.select("rect")
      .attr("width", w)
  }

  show (isShow = true) {
    this.g.selectAll("g.crosshair line")
      .attr("visibility", isShow ? "visible" : "hidden")
  }
  hide (isShow = false) {
    this.g.selectAll("g.crosshair line")
      .attr("visibility", isShow ? "visible" : "hidden")
  }

}
