export default (accessor_volume, plot, plotMixin) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let volumeGenerator;

  class volume {
    constructor(g) {
      const group = p.dataSelector(g);

      if(isOhlcAccessor()) plot.appendPathsUpDownEqual(group.selection, p.accessor, 'volume');
      else group.entry.append('path').attr('class', 'volume');

      volume.refresh(g);
    }

    static refresh(g) {
      if(isOhlcAccessor()) g.selectAll('path.volume').attr('d', volumeGenerator);
      else p.dataSelector.select(g).select('path.volume').attr('d', volumeGenerator);
    }
  }

  function binder() {
    volumeGenerator = plot.joinPath(volumePath);
  }

  function isOhlcAccessor() {
    return p.accessor.o && p.accessor.c;
  }

  function volumePath() {
    const accessor = p.accessor;
    const x = p.xScale;
    const y = p.yScale;
    const width = p.width(x);

    return d => {
      const vol = accessor.v(d);

      if(isNaN(vol)) return null;

      const zero = y(0);
      const height = y(vol) - zero;
      const xValue = x(accessor.d(d)) - width/2;

      return `M ${xValue} ${zero} l 0 ${height} l ${width} 0 l 0 ${-height}`;
    };
  }

  // Mixin 'superclass' methods and variables
  plotMixin(volume, p).plot(accessor_volume(), binder).width(binder).dataSelector(plotMixin.dataMapper.array);
  binder();

  return volume;
};
