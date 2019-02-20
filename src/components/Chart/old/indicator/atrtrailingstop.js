export default (indicatorMixin, accessor_ohlc, indicator_atr) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let multiplier = 3;
  const atr = indicator_atr();

  class indicator {
    constructor(data) {
      atr.accessor(p.accessor).period(p.period).init();

      return data.map((d, i) => {
        const close = p.accessor.c(d);
        const stop = atr.atr(d)*multiplier;
        if(i >= p.period) return { date: p.accessor.d(d), close, up: close-stop, down: close+stop };
        else return { date: p.accessor.d(d), up: null, down: null };
      })
        .filter(d => d.up !== null && d.down !== null) // Filter out empties
        .reduce((result, d, i) => {
          // Reduce to access the previous result array
          const prev = result[i-1];

          let // Always start with an up trend?
            up = i === 0 ? d.up : null;

          let down = null;

          if(prev && prev.up !== null) {
            if(d.close > prev.up) up = Math.max(d.up, prev.up);
            else down = d.down;
          }

          if(prev && prev.down !== null) {
            if(d.close < prev.down) down = Math.min(d.down, prev.down);
            else up = d.up;
          }

          result.push({ date: d.date, up, down });
          return result;
        }, []);
    }

    static multiplier(_) {
      if (!arguments.length) return multiplier;
      multiplier = _;
      return indicator;
    }
  }

  // Mixin 'superclass' methods and variables
  indicatorMixin(indicator, p)
    .accessor(accessor_ohlc())
    .period(14);

  return indicator;
};
