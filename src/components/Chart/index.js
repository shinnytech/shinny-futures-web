import * as d3 from 'd3'
import ChartDM from './ChartDataManager'
import Plot from './plot/plot'

const AppendG = (parent, left, top, className = "") => {
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

class PlotsManager {
  static PLOT_PADDING = 2 // 图表中间间隔
  constructor(plotsNumber, height){
    this._height = height
    this._plotsNumber = plotsNumber ? plotsNumber : 2
    this.positions = []
    this.initLayout()
  }

  set height (h) {
    this._height = h
    this.initLayout()
  }

  get height () {
    return this._height
  }

  set plotsNumber (n) {
    this._plotsNumber = n
    this.initLayout()
  }

  get plotsNumber () {
    return this._plotsNumber
  }



  initLayout () {
    let avg = 1 / this.plotsNumber
    let first = avg + avg * 0.3 * (this.plotsNumber - 1)
    let others = avg * 0.7
    let avalibleHeight = this.height - PlotsManager.PLOT_PADDING * (this.plotsNumber - 1)
    this.positions[0] = {
      height: avalibleHeight * first,
      top: 0
    }
    for(let i=1; i<this.plotsNumber; i++) {
      this.positions[i] = {
        height: avalibleHeight * others,
        top: this.positions[i-1].top + this.positions[i-1].height + PlotsManager.PLOT_PADDING
      }
    }
  }
}

class Chart {
  static ZOOM_SENSITIVITY = 3
  static BAR_WIDTH_MAX = 50
  static BAR_WIDTH_MIN = 3

  constructor(opts) {
    this.chartDm = new ChartDM({
      dm: opts.dm,
      ws: opts.ws,
      symbol: opts.instrumentId,
      duration: opts.duration
    });
    this.chartDm.addEventListener('update', this.draw.bind(this))

    this.divDomId = opts.id;
    this.outerWidth = opts.width;
    this.outerHeight = opts.height;
    this.margin = opts.margin ? opts.margin : {top: 10, right: 50, bottom: 30, left: 50};
    this.innerWidth = this.outerWidth - this.margin.left - this.margin.right;
    this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom

    this.init()
    this.plotsManager = new PlotsManager(2, this.innerHeight)
    this.mainPlot  = new Plot({
      name: 'candle',
      type: 'candle',
      barWidth: this.barWidth,
      barPadding: this.barPadding,
      parentG: this.rootG,

      width: this.innerWidth,
      height: this.plotsManager.positions[0].height,
      top: this.plotsManager.positions[0].top,
      // left: this.margin.left,

      xScale: this.xScale,
      chartDm: this.chartDm
    })

    this.subPlots = {
      volume: new Plot({
        name: 'volume',
        type: 'volume',
        barWidth: this.barWidth,
        barPadding: this.barPadding,
        parentG: this.rootG,

        width: this.innerWidth,
        height: this.plotsManager.positions[1].height,
        top: this.plotsManager.positions[1].top,
        // left: this.margin.left,

        xScale: this.xScale,
        chartDm: this.chartDm
      }),
      oi: new Plot({
        name: 'oi',
        type: 'oi',
        barWidth: this.barWidth,
        barPadding: this.barPadding,
        parentG: this.rootG,

        yAxisPos: 'right',
        width: this.innerWidth,
        height: this.plotsManager.positions[1].height,
        top: this.plotsManager.positions[1].top,
        // left: this.margin.left,

        xScale: this.xScale,
        chartDm: this.chartDm
      })
    }
  }

  showLoading(show = true) {
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
    // crosshair
    this.mouseG = AppendG(this.svg, this.margin.left, this.margin.top, "mouse")
    this.mouseG.append('g')
      .attr("class", 'x')
      .append('line')
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", this.innerWidth)
      .attr("y2", 0)
      .attr("stroke", '#bbbbbb')
      .attr("stroke-dasharray", '2 4')
      .attr("visibility", "hidden")
    this.mouseG.append('g')
      .attr("class", 'y')
      .append('line')
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", this.innerHeight)
      .attr("stroke", '#bbbbbb')
      .attr("stroke-dasharray", '2 4')
      .attr("visibility", "hidden")
    this.mouseG.append('g')
      .attr("class", 'text')
      .append('text')
      .attr("fill", "grey")
      .attr("x", 4)
      .attr("y", 4)
    let that = this;
    this.mouseG.selectAll("rect.mouse")  // For new circle, go through the update process
      .data([0])
      .enter()
      .append("rect")
      .attr("class", 'mouse')
      .attr("width", this.innerWidth)
      .attr("height", this.innerHeight)
      .attr("fill-opacity", 0)
      .on("mouseover", function(){
        that.mouseG.selectAll("g.x line")
          .attr("visibility", "visible")
        that.mouseG.selectAll("g.y line")
          .attr("visibility", "visible")
      })
      .on("mousemove", function(){
        let [x, y] = d3.mouse(this)
        let xBars = Math.round(x / that.barWidth)
        let xAlign = Math.round(x / that.barWidth) * that.barWidth + that.barWidth / 2
        let data = that.chartDm.klines.data[that.chartDm.left_id + xBars]
        let showText = `高 ${data.high} 开 ${data.open} 低 ${data.low} 收 ${data.close}`
        that.mouseG.selectAll("g.text text")
          .text(showText)

        that.mouseG.selectAll("g.x line")
          .attr('y1', y)
          .attr('y2', y)
        that.mouseG.select("g.y line")
          .attr('x1', xAlign)
          .attr('x2', xAlign)
      })
      .on("mouseleave", function(){
        that.mouseG.selectAll("g.x line")
          .attr("visibility", "hidden")
        that.mouseG.selectAll("g.y line")
          .attr("visibility", "hidden")
      })

    // console.log(this.svg)
    // console.log(this.mouseG)
    // this.svg.on('click', function(){
    //     console.log('click', d3.mouse(this))
    //   })
    //   .on('mouseenter', function(){
    //     console.log('mouseenter', d3.mouse(this))
    //   })
    //   .on('mousemove', function(){
    //     console.log(d3.event.x, d3.mouse(this))
    //   })
    //   .on('mouseleave', function(){
    //     console.log('mouseleave', d3.mouse(this))
    //   })



    AppendG(this.rootG, 0, this.innerHeight, "x axis")
    // 设置初始化柱子大小
    this.setBarNumbers();
    // 处理拖动事件  使用 rootG 要设置长宽
    let initX = null;
    let dragOnMove = d3.drag()
      .on("start", function () {
        initX = d3.event.x
        that.mouseG.selectAll("g.x line")
          .attr("visibility", "hidden")
        that.mouseG.selectAll("g.y line")
          .attr("visibility", "hidden")
      }).on("drag", function () {
        let moves = Math.round((d3.event.x - initX) / that.barWidth);
        if (Math.abs(moves) > 0) {
          initX = d3.event.x;
          that.move(moves) // 移动 moves 柱子
        }
      }).on("end", function () {
        initX = null
        that.mouseG.selectAll("g.x line")
          .attr("visibility", "visible")
        that.mouseG.selectAll("g.y line")
          .attr("visibility", "visible")
      });

    this.svg.call(dragOnMove)

    // 处理缩放事件
    let deltaY = 0
    let zoom = d3.zoom()
      .on('zoom', function () {
        deltaY += d3.event.sourceEvent.deltaY
        if (Math.abs(deltaY) >= Chart.ZOOM_SENSITIVITY) {
          let _zoom = Math.round(Math.abs(deltaY) / Chart.ZOOM_SENSITIVITY)
          _zoom = deltaY > 0 ? _zoom : -_zoom
          that.debounce(that.zoom, 200).bind(that)(_zoom)
          deltaY = 0
        }
      })
    this.svg.call(zoom)
  }

  debounce (fn, delay) {
    // 维护一个 timer
    let timer = null

    return function() {
      // 通过 ‘this’ 和 ‘arguments’ 获取函数的作用域和变量
      let context = this
      let args = arguments
      clearTimeout(timer)
      timer = setTimeout(function() {
        fn.apply(context, args)
      }, delay)
    }

    // function debouce(func, delay, immediate){
    //   let timer = null
    //   return function(){
    //     var context = this;
    //     var args = arguments;
    //     if(timer) clearTimeout(time);
    //     if(immediate){
    //       //根据距离上次触发操作的时间是否到达delay来决定是否要现在执行函数
    //       var doNow = !timer;
    //       //每一次都重新设置timer，就是要保证每一次执行的至少delay秒后才可以执行
    //       timer = setTimeout(function(){
    //         timer = null;
    //       },delay);
    //       //立即执行
    //       if(doNow){
    //         func.apply(context,args);
    //       }
    //     }else{
    //       timer = setTimeout(function(){
    //         func.apply(context,args);
    //       },delay);
    //     }
    //   }
    // }
  }

  setHeight(h) {
    this.outerHeight = h;
    this.innerHeight = this.outerHeight - this.margin.top - this.margin.bottom;
    this.svg.attr("height", this.outerHeight);
    this.rootG.select('g.x.axis')
      .attr("transform", "translate(0," + this.innerHeight + ")")

    this.plotsManager.height = this.innerHeight

    this.mainPlot.height = this.plotsManager.positions[0].height
    this.mainPlot.top = this.plotsManager.positions[0].top
    for (let sub in this.subPlots) {
      this.subPlots[sub].height = this.plotsManager.positions[1].height
      this.subPlots[sub].top = this.plotsManager.positions[1].top
    }
    this.draw()
  }

  setBarNumbers(barNumbers = this.chartDm.view_width) {
    this.barNumbers = barNumbers
    this.barWidth = this.innerWidth / this.barNumbers
    this.xScale.range([0, this.innerWidth - this.barWidth])
    this.rootG.selectAll("g.x.axis").attr("transform", "translate(" + ( this.barWidth / 2) + "," + this.innerHeight + ")")
    this.barPaddingTimes = 0.2 // 柱子左右各留 20% 空白
    this.barPadding = this.barWidth * this.barPaddingTimes
    if (this.chartDm.view_width !== this.barNumbers) this.chartDm.view_width = this.barNumbers
    if (this.mainPlot) {
      this.mainPlot.barWidth = this.barWidth
      this.mainPlot.barPadding = this.barPadding
      for (let sub in this.subPlots) {
        this.subPlots[sub].barWidth = this.barWidth
        this.subPlots[sub].barPadding = this.barPadding
      }
    }
  }

  setSymbol (s) {
    this.chartDm.symbol = s
    this.draw()
  }

  setDuration (d) {
    this.chartDm.duration = d
    this.draw()
  }

  move(moves) { // moves 正数右移 负数左移 moves 根柱子
    this.chartDm.moves(moves)
    this.draw()
  }

  zoom(n) { // n 正数放大/负数缩小 n 根柱子
    let tempBarWidth = this.innerWidth / (this.barNumbers - n)
    if (tempBarWidth >= Chart.BAR_WIDTH_MIN && tempBarWidth <= Chart.BAR_WIDTH_MAX) {
      this.setBarNumbers(this.barNumbers - n)
      this.draw()
    }
  }

  drawXAxis() {
    this.xScale.domain([this.chartDm.left_id, this.chartDm.right_id])
    let data = this.chartDm.klines.data
    this.xAxis.tickFormat((x) => {
      return data[x] && data[x].datetime ? MultiFormat(data[x].datetime / 1e6) : ''
    })
    this.rootG.selectAll("g.x.axis").call(this.xAxis)
  }

  draw() {
    if (this.chartDm.left_id === -1 || this.chartDm.right_id === -1) return false
    this.showLoading(false)
    this.drawXAxis()
    this.mainPlot.draw()
    for (let sub in this.subPlots) {
      this.subPlots[sub].draw()
    }
  }
}

export default Chart
