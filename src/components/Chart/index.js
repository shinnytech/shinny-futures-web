import * as d3 from 'd3'
import { OhlcPlot, CandlePlot }  from './plot'

const AppendG = (parent, left, top, className="") => {
  return parent.append('g')
    .attr("transform", "translate(" + left + "," + top + ")")
    .attr("class", className)
}

let formatMillisecond = d3.timeFormat(".%L"),
  formatSecond = d3.timeFormat(":%S"),
  formatMinute = d3.timeFormat("%H:%M"),
  formatHour = d3.timeFormat("%H:%M"),
  formatDay = d3.timeFormat("%m%d"),
  formatMonth = d3.timeFormat("%m%d"),
  formatYear = d3.timeFormat("%y");

function MultiFormat(date) {
  return (d3.timeSecond(date) < date ? formatMillisecond
    : d3.timeMinute(date) < date ? formatSecond
      : d3.timeHour(date) < date ? formatMinute
        : d3.timeDay(date) < date ? formatHour
          : d3.timeMonth(date) < date ? formatDay
            : d3.timeYear(date) < date ? formatMonth
              : formatYear)(date);
}

class ChartDataManager {
  constructor(symbol, duration){
    this.
    this.reset(symbol, duration)
  }

  reset(symbol, duration) {
    this.symbol = symbol
    this.duration = duration
  }
}

class Chart {
  constructor(opts) {
    this.divDomId = opts.id
    this.outerWidth = opts.width
    this.outerHeight = opts.height
    this.margin = opts.margin ? opts.margin : { top: 10, right: 50, bottom: 30, left: 50 }
    this.innerWidth = this.outerWidth - this.margin.left - this.margin.right
    this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom
    this.period = opts.period // 图表周期
    this.quote = opts.quote
    this.init()
  }
  showLoading (show = true) {
    this.loadingG.attr("visibility", show ? "visible" : "hidden")
  }
  init() {
    // 初始化 svg
    this.svg = d3.select("#" + this.divDomId).append("svg")
      .attr("width", this.outerWidth)
      .attr("height", this.outerHeight)
    // 根结点
    this.rootG = AppendG(this.svg, this.margin.left, this.margin.top)
    // 加载中
    this.loadingG = this.svg.append('g')
      .attr("width", this.outerWidth)
      .attr("height", this.outerHeight)
      .attr("class", 'loading')
      .append('text')
      .attr("x", "50%")
      .attr("y", "50%")
      .attr("text-anchor", "middle")
      .attr('font-size', 50)
      .text('正在加载数据')

    // 初始化 X 轴
    this.xScale = d3.scaleLinear().range([0, this.innerWidth])
    this.xAxis = d3.axisBottom().scale(this.xScale)
    AppendG(this.rootG, 0, this.innerHeight, "x axis")

    this.setBarNumbers() // 设置初始化柱子大小


    this.chartsList = {
      candlestick: {
        name: 'candle',
        barWidth: this.barWidth,
        barPadding: this.barPadding,
        parentG: this.rootG,

        width: this.innerWidth,
        height: this.innerHeight,
        top: this.margin.top,
        left: this.margin.left,

        xScale: this.xScale,

        quote: this.quote
      }
    }
    this.candlestick = new CandlePlot(this.chartsList.candlestick)
    this.candlestick.setBarWidth(this.barWidth, this.barPadding)
  }

  setHeight(h) {
    this.outerHeight = h
    this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom

    this.svg.attr("height", this.outerHeight)
    this.rootG.select('g.x.axis')
      .attr("transform", "translate(0," + this.innerHeight + ")")

    this.candlestick.setHeight(this.innerHeight)
    this.candlestick.redraw(this.left_id, this.right_id)
  }


  setBarNumbers(barNumbers = 100) {
    this.barNumbers = barNumbers
    this.barWidth = this.innerWidth / this.barNumbers
    this.barPaddingTimes = 0.2 // 柱子左右各留 20% 空白
    this.barPadding = this.barWidth * this.barPaddingTimes

    if(this.candlestick && this.candlestick.setBarWidth){
      this.candlestick.setBarWidth(this.barWidth, this.barPadding)
    }
  }

  move (moves) {
    // moves 正数右移 负数左移 moves 根柱子
    let temp_offset = this.offset + moves
    if (temp_offset > -20) {
      this.offset = temp_offset
      // todo redraw
      return true
    }
    return false
  }
  zoom (n) {
    // n 正数放大/负数缩小 n 根柱子
    // barWidth 最小 3 最大 30
    let tempBarWidth = this.innerWidth / (this.barNumbers - n)
    if (tempBarWidth >= 3 && tempBarWidth <= 30) {
      this.setBarNumbers(this.barNumbers - n)
      return true
      // todo redraw
    }
    return false
  }

  setData(data) {
    this.klines = data
    this.data = data.data
    this.candlestick.setData(this.klines)
  }

  setDrawRange (){
    if (this.klines) {
      this.left_id = this.klines.last_id - this.barNumbers + 1
      this.right_id = this.klines.last_id
      return true
    }
    return false
  }

  drawXAxis () {
    this.xScale.domain([this.left_id, this.right_id])
    this.xAxis.tickFormat((x) => {
      return MultiFormat(this.data[x].datetime / 1e6 )
    })
    this.rootG.selectAll("g.x.axis").call(this.xAxis)
  }

  draw (){
    if (!this.setDrawRange()) return false
    this.showLoading(false)
    this.drawXAxis()
    this.candlestick.redraw(this.left_id, this.right_id)
  }
}

export default Chart
