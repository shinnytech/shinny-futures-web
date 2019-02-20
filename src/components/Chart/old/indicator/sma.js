export default (indicatorMixin, accessor_ohlc) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let samples;
  let currentIndex;
  let total;

  class indicator {
    constructor(data) {
      indicator.init();
      return data.map(ma).filter(d => d.value !== null);
    }

    static init() {
      total = 0;
      samples = [];
      currentIndex = 0;
      return indicator;
    }

    static average(value) {
      total += value;

      if(samples.length+1 < p.period) {
        samples.push(value);
        return total/++currentIndex;
      }
      else {
        if(samples.length < p.period) {
          samples.push(value);
          total += value;
        }

        total -= samples[currentIndex];
        samples[currentIndex] = value;
        if(++currentIndex === p.period) {
          currentIndex = 0;
        }

        return total/p.period;
      }
    }
  }

  function ma(d, i) {
    let value = indicator.average(p.accessor(d));
    if (i+1 < p.period) value = null;
    return { date: p.accessor.d(d), value };
  }

  // Mixin 'superclass' methods and variables
  indicatorMixin(indicator, p)
    .accessor(accessor_ohlc())
    .period(10);

  return indicator;
};
