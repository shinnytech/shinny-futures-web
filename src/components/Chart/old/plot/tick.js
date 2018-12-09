export default (d3_scale_linear, d3_extent, accessor_tick, plot, plotMixin) => () => {
  // Closure constructor
  const // Container for private, direct access mixed in variables
    p = {};

  let tickGenerator;
  let lineWidthGenerator;

  class tick {
    constructor(g) {
      p.dataSelector(g).entry.append('path').attr('class', 'tick');

      tick.refresh(g);
    }

    static refresh(g) {
      p.dataSelector.select(g).select('path.tick').attr('d', tickGenerator).style('stroke-width', lineWidthGenerator);
    }
  }

  function binder() {
    tickGenerator = plot.joinPath(tickPath);
    lineWidthGenerator = plot.scaledStrokeWidth(p.xScale, 1, 2);
  }

  function tickPath() {
    const accessor = p.accessor;
    const x = p.xScale;
    const y = p.yScale;
    const width = p.width(x);

    return d => {
      const high = y(accessor.h(d));
      const low = y(accessor.l(d));
      const xPoint = x(accessor.d(d));
      const xValue = xPoint - width/2;

      return `M ${xValue} ${high} l ${width} 0 M ${xPoint} ${high} L ${xPoint} ${low} M ${xValue} ${low} l ${width} 0`;
    };
  }

  // Mixin 'superclass' methods and variables
  plotMixin(tick, p).plot(accessor_tick(), binder).width(binder).dataSelector(plotMixin.dataMapper.array);
  binder();

  return tick;
};
