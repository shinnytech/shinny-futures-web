export default (accessor_bollinger, plot, plotMixin) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  const upperLine = plot.pathLine();
  const middleLine = plot.pathLine();
  const lowerLine = plot.pathLine();

  class bollinger {
    constructor(g) {
      const group = p.dataSelector(g);
      group.entry.append('path').attr('class', 'upper');
      group.entry.append('path').attr('class', 'middle');
      group.entry.append('path').attr('class', 'lower');
      bollinger.refresh(g);
    }

    static refresh(g) {
      refresh(p.dataSelector.select(g), upperLine, middleLine, lowerLine);
    }
  }

  function binder() {
    upperLine.init(p.accessor.d, p.xScale, p.accessor.upper, p.yScale);
    middleLine.init(p.accessor.d, p.xScale, p.accessor.middle, p.yScale);
    lowerLine.init(p.accessor.d, p.xScale, p.accessor.lower, p.yScale);
  }

  // Mixin 'superclass' methods and variables
  plotMixin(bollinger, p).plot(accessor_bollinger(), binder).dataSelector(plotMixin.dataMapper.array);
  binder();

  return bollinger;
};

function refresh(selection, upperLine, middleLine, lowerLine) {
  selection.select('path.upper').attr('d', upperLine);
  selection.select('path.middle').attr('d', middleLine);
  selection.select('path.lower').attr('d', lowerLine);
}
