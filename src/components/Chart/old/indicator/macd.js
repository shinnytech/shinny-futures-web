export default (indicatorMixin, accessor_ohlc, indicator_ema) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let fast = 12;
  let slow = 26;
  let signal = 9;
  const signalLine = indicator_ema();
  const fastAverage = indicator_ema();
  const slowAverage = indicator_ema();

  class indicator {
    constructor(data) {
      const minFastSlow = Math.max(fast, slow) - 1;
      const minCount = minFastSlow + signal - 1;

      signalLine.accessor(indicator.accessor()).period(signal).init();
      fastAverage.accessor(indicator.accessor()).period(fast).init();
      slowAverage.accessor(indicator.accessor()).period(slow).init();

      return data.map((d, i) => {
        const macd = fastAverage.average(p.accessor(d)) - slowAverage.average(p.accessor(d));
        const signalValue = i >= minFastSlow ? signalLine.average(macd) : null;

        if(i >= minCount) return datum(p.accessor.d(d), macd, signalValue, macd - signalValue, 0);
        else return datum(p.accessor.d(d));
      }).filter(d => d.macd !== null);
    }

    static fast(_) {
      if (!_) return fast;
      fast = _;
      return indicator;
    }

    static slow(_) {
      if (!_) return slow;
      slow = _;
      return indicator;
    }

    static signal(_) {
      if (!_) return signal;
      signal = _;
      return indicator;
    }
  }

  // Mixin 'superclass' methods and variables
  indicatorMixin(indicator, p).accessor(accessor_ohlc());

  return indicator;
};

function datum(date, macd, signal, difference, zero) {
  if(macd) return { date, macd, signal, difference, zero };
  else return { date, macd: null, signal: null, difference: null, zero: null };
}
