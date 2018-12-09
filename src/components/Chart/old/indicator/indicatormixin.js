export default (source, priv) => {
  const indicatorMixin = {};

  indicatorMixin.period = period => {
    priv.period = period;

    source.period = function(_) {
      if (!arguments.length) return priv.period;
      priv.period = +_;
      return source;
    };

    return indicatorMixin;
  };

  indicatorMixin.accessor = accessor => {
    priv.accessor = accessor;

    // Mixin the functions to the source
    source.accessor = function (_) {
      if (!arguments.length) return priv.accessor;
      priv.accessor = _;
      return source;
    };

    return indicatorMixin;
  };

  return indicatorMixin;
};
