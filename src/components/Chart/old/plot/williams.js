export default (accessor_williams, plot, plotMixin) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  const upLine = plot.pathLine();

  class williams {
    constructor(g) {
      p.dataSelector(g).entry.append('path').attr('class', 'williams up');
      williams.refresh(g);
    }

    static refresh(g) {
      p.dataSelector.select(g).select('path.williams.up').attr('d', upLine);
    }
  }

  function binder() {
    upLine.init(p.accessor.d, p.xScale, p.accessor.w, p.yScale);
  }

  // Mixin 'superclass' methods and variables
  plotMixin(williams, p).plot(accessor_williams(), binder).dataSelector(plotMixin.dataMapper.array);
  binder();

  return williams;
};
