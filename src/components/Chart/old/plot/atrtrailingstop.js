export default (accessor_atrtrailingstop, plot, plotMixin) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  const upLine = plot.pathLine();
  const downLine = plot.pathLine();

  class atrtrailingstop {
    constructor(g) {
      const group = p.dataSelector(g);

      group.entry.append('path').attr('class', 'up');
      group.entry.append('path').attr('class', 'down');

      atrtrailingstop.refresh(g);
    }

    static refresh(g) {
      refresh(p.dataSelector.select(g), upLine, downLine);
    }
  }

  function binder() {
    upLine.init(p.accessor.d, p.xScale, p.accessor.up, p.yScale);
    downLine.init(p.accessor.d, p.xScale, p.accessor.dn, p.yScale);
  }

  // Mixin 'superclass' methods and variables
  plotMixin(atrtrailingstop, p).plot(accessor_atrtrailingstop(), binder).dataSelector(plotMixin.dataMapper.array);
  binder();

  return atrtrailingstop;
};

function refresh(selection, upLine, downLine) {
  selection.select('path.up').attr('d', upLine);
  selection.select('path.down').attr('d', downLine);
}
