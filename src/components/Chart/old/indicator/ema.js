export default (indicatorMixin, accessor_ohlc, alpha_init) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let previous;
  let alpha;
  let initialTotal;
  let initialCount;

  class indicator {
    constructor(data) {
      indicator.init();
      return data.map(ma).filter(d => d.value !== null);
    }

    static init() {
      previous = null;
      alpha = alpha_init(p.period);
      initialTotal = 0;
      initialCount = 0;
      return indicator;
    }

    static average(value) {
      if(initialCount < p.period) return (previous = (initialTotal += value)/++initialCount);
      else return (previous = previous + alpha*(value-previous));
    }
  }

  function ma(d, i) {
    let value = indicator.average(p.accessor(d));
    if (i+1 < p.period) {
      value = null;
    }

    return { date: p.accessor.d(d), value };
  }

  // Mixin 'superclass' methods and variables
  indicatorMixin(indicator, p)
    .accessor(accessor_ohlc())
    .period(10);

  return indicator;
};
