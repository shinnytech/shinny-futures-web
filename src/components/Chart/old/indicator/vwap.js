export default (indicatorMixin, accessor_ohlc) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let cumul_total;
  let cumul_volume;
  let prev_date;

  class indicator {
    constructor(data) {
      indicator.init();
      return data.map(vwap).filter(d => d.value !== null);
    }

    static init() {
      cumul_total = 0;
      cumul_volume = 0;
      return indicator;
    }
  }

  function vwap(d, i) {
    // VWAP restarts when day changes
    if (i > 0 && prev_date.getDate() != p.accessor.d(d).getDate()) {
      cumul_total = 0;
      cumul_volume = 0;
    }

    const price = (p.accessor.h(d) + p.accessor.l(d) + p.accessor.c(d)) / 3;
    cumul_total += price * p.accessor.v(d);
    cumul_volume += p.accessor.v(d);

    prev_date = p.accessor.d(d);
    return { date: p.accessor.d(d), value: cumul_total / cumul_volume };
  }

  // Mixin 'superclass' methods and variables
  indicatorMixin(indicator, p)
    .accessor(accessor_ohlc())
    .period(1);

  return indicator;
};
