export default (indicatorMixin, accessor_ohlc) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let tenkanSen = 9;
  let kijunSen = 26;
  let senkouSpanB = 52;

  class indicator {
    constructor(data) {
      const parameters = { tenkanSen, kijunSen, senkouSpanB };
      const result = new Array(data.length);

      // Iterate backwards through the data
      for(let index = result.length-1; index >= 0; index--) {
        result[index] = calculate(parameters, data, index);
      }

      return result;
    }

    static tenkanSen(_) {
      if (!_) return tenkanSen;
      tenkanSen = _;
      return indicator;
    }

    static kijunSen(_) {
      if (!_) return kijunSen;
      kijunSen = _;
      return indicator;
    }

    static senkouSpanB(_) {
      if (!_) return senkouSpanB;
      senkouSpanB = _;
      return indicator;
    }
  }

  function calculate(parameters, data, index) {
    let d = data[index];
    let min = p.accessor.l(d);
    let max = p.accessor.h(d);
    const current = datum(parameters, p.accessor.d(d), p.accessor.c(d));

    // Iterate backwards through the data up to sendouSpanB count to calculate averages
    for(let i = 0, pos = i+1; i < parameters.senkouSpanB && index-i >= 0; i++, pos = i+1) {
      d = data[index-i];
      min = Math.min(min, p.accessor.l(d));
      max = Math.max(max, p.accessor.h(d));

      // Grab a snapshot of average of min and max for each of the parameter periods
      current.tenkanSen = pos === parameters.tenkanSen ? average(min, max) : current.tenkanSen;
      current.kijunSen = pos === parameters.kijunSen ? average(min, max) : current.kijunSen;
      current.senkouSpanB = pos === parameters.senkouSpanB ? average(min, max) : current.senkouSpanB;
    }

    // Initialise if there is enough data
    current.senkouSpanA = senkouSpanA(current.tenkanSen, current.kijunSen);

    return current;
  }

  // Mixin 'superclass' methods and variables
  indicatorMixin(indicator, p).accessor(accessor_ohlc());

  return indicator;
};

function datum(parameters, date, chikouSpan) {
  return { parameters, date, chikouSpan, tenkanSen: null, kijunSen: null, senkouSpanA: null, senkouSpanB: null };
}

function senkouSpanA(tenkanSen, kijunSen) {
  return tenkanSen !== null && kijunSen !== null ? average(tenkanSen, kijunSen) : null;
}

function average(v1, v2) {
  return (v1+v2)/2;
}
