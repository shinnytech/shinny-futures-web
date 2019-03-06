export default class Loading{
  constructor (opts) {
    this.parentG = opts.parentG
    this.name = opts.name
    this.g = this.parentG
      .append('g')
      .attr('class', this.name)

    this._text = '正在加载数据'
    this._isShow = opts.show ? opts.show : false
    this.textG = this.g.append('text')
      .attr("x", "50%")
      .attr("y", "50%")
      .attr("text-anchor", "middle")
      .attr('font-size', 50)
      .text(this._text)
      .attr("visibility", this._isShow ? "visible" : "hidden")
  }

  get show () {
    return this._isShow
  }

  set show (show) {
    this._isShow = !!show
    this.textG.attr("visibility", this._isShow ? "visible" : "hidden")
  }

  get text () {
    return this._text
  }

  set text (t) {
    this._text = String(t)
    this.textG.text(this._text)
  }

}
