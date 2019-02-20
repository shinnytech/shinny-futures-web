export default (d3_scale_linear, d3_extent, accessor_ohlc, plot, plotMixin) => () => {
  // Closure constructor
  // Container for private, direct access mixed in variables
  const p = {};

  let bodyPathGenerator;
  let wickGenerator;
  let wickWidthGenerator;

  function candlestick (g) {
    let group = p.dataSelector(g);

    // 3x2 path's as wick and body can be styled slightly differently (stroke and fills)
    plot.appendPathsUpDownEqual(group.selection, p.accessor, ['candle', 'body']);
    plot.appendPathsUpDownEqual(group.selection, p.accessor, ['candle', 'wick']);

    candlestick.refresh(g);
  }

  candlestick.refresh = function (g) {
    g.selectAll('path.candle.body')
      .attr('d', bodyPathGenerator);
    g.selectAll('path.candle.wick')
      .attr('d', wickGenerator).style('stroke-width', wickWidthGenerator);
  }

  function binder() {
    bodyPathGenerator = plot.joinPath(bodyPath);
    wickGenerator = plot.joinPath(wickPath);
    wickWidthGenerator = plot.scaledStrokeWidth(p.xScale, 1, 4);
  }

  function bodyPath() {
    const accessor = p.accessor;
    const x = p.xScale;
    const y = p.yScale;
    const width = p.width(x);

    return d => {
      const open = y(accessor.o(d));
      const close = y(accessor.c(d));

      const xValue = x(d.date) - width/2;

      let path = `M ${xValue} ${open} l ${width} ${0}`;

      // Draw body only if there is a body (there is no stroke, so will not appear anyway)
      if(open != close) {
        path += ` L ${xValue + width} ${close} l ${-width} ${0} L ${xValue} ${open}`;
      }

      return path;
    };
  }

  function wickPath() {
    const accessor = p.accessor;
    const x = p.xScale;
    const y = p.yScale;
    const width = p.width(x);

    return d => {
      const open = y(accessor.o(d)); // Top
      const close = y(accessor.c(d));
      const xPoint = x(d.date);
      const xValue = xPoint - width/2;

      let path = `M ${xPoint} ${y(d.high)} L ${xPoint} ${Math.min(open, close)}`;

      // Draw another cross wick if there is no body
      if(open == close) {
        path += ` M ${xValue} ${open} l ${width} ${0}`;
      }
      // Bottom
      return `${path} M ${xPoint} ${Math.max(open, close)} L ${xPoint} ${y(d.low)}`;
    };
  }

  // Mixin 'superclass' methods and variables
  plotMixin(candlestick, p)
    .plot(accessor_ohlc(), binder)
    .width(binder)
    .dataSelector(plotMixin.dataMapper.array)
  console.log(p)

  binder();

  return candlestick;
};
