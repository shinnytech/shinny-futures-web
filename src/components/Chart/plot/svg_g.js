export default class SVG_G {
  constructor (opts) {
    this.parentG = opts.parentG
    this.name = opts.name
    this.g = this.parentG
      .append('g')
      .attr('class', this.name)

    this._top = opts.top ? opts.top : 0
    this._left = opts.left ? opts.left : 0
    this._height = opts.height ? opts.height : 0
    this._width = opts.width ? opts.width : 0

    this.g.attr("transform", "translate(" + this._left + "," + this._top + ")")
      .attr("height", this._height)
      .attr("width", this._width)
  }

  appendPlotPathClasses(classesList) {
    this.g.selectAll('path')
      .data(classesList, d => SVG_G.ArrayJoin(d, '.'))
      .enter()
      .append('path')
      .attr('class', (d) => SVG_G.ArrayJoin(d, ' '))
      .exit().remove()
  }

  appendPlotPaths(paths) {
    // paths = [{classes, paths}, ...]
    // toArray
    // required {classes, paths}
    // optional {}
    let pathArray = paths instanceof Array ? paths : null
    if (typeof paths === 'object') {
      pathArray = []
      Object.keys[paths].forEach(k => {
        pathArray.push(paths[k])
      })
    }
    if (pathArray === null) return
    let selections = this.g.selectAll('path')
      .data(pathArray, d => SVG_G.ArrayJoin(d.classes, '.'))
    selections.exit().remove()
    selections.enter()
      .append('path')
      .attr('class', (d) => SVG_G.ArrayJoin(d.classes, ' '))
      .merge(selections)
      .attr('d', (d) => d.paths)
  }

  top (t) {
    if (t) {
      this._top = t
      this.g.attr("transform", "translate(" + this._left + "," + this._top + ")")
    }
    return this._top
  }
  left (l) {
    if (l) {
      this._left = l
      this.g.attr("transform", "translate(" + this._left + "," + this._top + ")")
    }
    return this._left
  }
  height (h) {
    if (h) {
      this._height = h
      this.g.attr("height", this._height)
    }
    return this._height
  }
  width (w) {
    if (w) {
      this._width = w
      this.g.attr("width", this._width)
    }
    return this._width
  }

  static ArrayJoin (array, delimiter=' ') {
    if (array instanceof Array) return array.join(delimiter)
    if (typeof array === 'string') return array
    return ''
  }
}
