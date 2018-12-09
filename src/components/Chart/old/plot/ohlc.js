export default (d3_scale_linear, d3_extent, accessor_ohlc, plot, plotMixin) => () => {
  // Closure constructor
  const // Container for private, direct access mixed in variables
    p = {};

  let ohlcGenerator;
  let lineWidthGenerator;

  class ohlc {
    constructor(g) {
      plot.appendPathsUpDownEqual(p.dataSelector(g).selection, p.accessor, 'ohlc');

      ohlc.refresh(g);
    }

    static refresh(g) {
      g.selectAll('path.ohlc').attr('d', ohlcGenerator).style('stroke-width', lineWidthGenerator);
    }
  }

  function binder() {
    ohlcGenerator = plot.joinPath(ohlcPath);
    lineWidthGenerator = plot.scaledStrokeWidth(p.xScale, 1, 2);
  }

  function ohlcPath() {
    const accessor = p.accessor;
    const x = p.xScale;
    const y = p.yScale;
    const width = p.width(x);

    return d => {
      const open = y(accessor.o(d));
      const close = y(accessor.c(d));
      const xPoint = x(accessor.d(d));
      const xValue = xPoint - width/2;

      return `M ${xValue} ${open} l ${width/2} 0 M ${xPoint} ${y(accessor.h(d))} L ${xPoint} ${y(accessor.l(d))} M ${xPoint} ${close} l ${width/2} 0`;
    };
  }

  // Mixin 'superclass' methods and variables
  plotMixin(ohlc, p).plot(accessor_ohlc(), binder).width(binder).dataSelector(plotMixin.dataMapper.array);
  binder();

  return ohlc;
};
