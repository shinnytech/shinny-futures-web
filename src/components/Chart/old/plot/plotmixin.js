/**
 * Module allows optionally mixing in helper methods to plots such as xScale, yScale, accessor setters
 * and helpers for defining dispatching methods.
 */
export default (
  d3_scale_linear,
  d3_functor,
  techan_scale_financetime,
  plot_dataselector,
  plot_width) => {
  const PlotMixin = (source, priv) => {
    const plotMixin = {};

    /**
     * Where mapper is DataSelector.mapper.unity or DataSelector.mapper.array. For convenience DataSelector is available
     * at PlotMixin.mapper
     *
     * @param mapper
     * @param key
     * @returns {{}}
     */
    plotMixin.dataSelector = (mapper, key) => {
      console.log(plot_dataselector(mapper).key(key))
      priv.dataSelector = plot_dataselector(mapper).key(key);
      console.log(priv.dataSelector)
      return plotMixin;
    };

    plotMixin.xScale = binder => {
      priv.xScale = new techan_scale_financetime();

      source.xScale = function(_) {
        if (!arguments.length) return priv.xScale;
        priv.xScale = _;
        if(binder) binder();
        return source;
      };

      return plotMixin;
    };

    plotMixin.yScale = binder => {
      priv.yScale = d3_scale_linear();

      source.yScale = function(_) {
        if (!arguments.length) return priv.yScale;
        priv.yScale = _;
        if(binder) binder();
        return source;
      };

      return plotMixin;
    };

    plotMixin.accessor = (accessor, binder) => {
      priv.accessor = accessor;

      source.accessor = function(_) {
        if (!arguments.length) return priv.accessor;
        priv.accessor = _;
        if(binder) binder();
        return source;
      };

      return plotMixin;
    };

    plotMixin.width = binder => {
      priv.width = plot_width;

      source.width = function(_) {
        if (!arguments.length) return priv.width;
        priv.width = d3_functor(_);
        if(binder) binder();
        return source;
      };

      return plotMixin;
    };

    plotMixin.on = (dispatch, binder) => {
      source.on = (type, listener) => {
        dispatch.on(type, listener);
        if(binder) binder();
        return source;
      };

      return plotMixin;
    };

    /**
     * Generic mixin used for most plots
     * @returns {plotMixin}
     */
    plotMixin.plot = (accessor, binder) => plotMixin.xScale(binder).yScale(binder).accessor(accessor, binder);

    return plotMixin;
  };

  // Carry the mappers through for convenience
  PlotMixin.dataMapper = plot_dataselector.mapper;

  return PlotMixin;
};
