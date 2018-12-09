export default (accessor_adx, plot, plotMixin) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  const adxLine = plot.pathLine();
  const plusDiLine = plot.pathLine();
  const minusDiLine = plot.pathLine();

  class adx {
    constructor(g) {
      const group = p.dataSelector(g);

      group.entry.append('path').attr('class', 'adx');
      group.entry.append('path').attr('class', 'plusDi');
      group.entry.append('path').attr('class', 'minusDi');

      adx.refresh(g);
    }

    static refresh(g) {
      refresh(p.dataSelector.select(g), adxLine, plusDiLine, minusDiLine);
    }
  }

  function binder() {
    adxLine.init(p.accessor.d, p.xScale, p.accessor.adx, p.yScale);
    plusDiLine.init(p.accessor.d, p.xScale, p.accessor.plusDi, p.yScale);
    minusDiLine.init(p.accessor.d, p.xScale, p.accessor.minusDi, p.yScale);
  }

  // Mixin 'superclass' methods and variables
  plotMixin(adx, p).plot(accessor_adx(), binder).dataSelector(plotMixin.dataMapper.array);
  binder();

  return adx;
};

function refresh(selection, adxLine, plusDiLine, minusDiLine) {
  selection.select('path.adx').attr('d', adxLine);
  selection.select('path.plusDi').attr('d', plusDiLine);
  selection.select('path.minusDi').attr('d', minusDiLine);
}
