export default (indicatorMixin, accessor_ohlc, indicator_ema) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let overbought = 70;
  let middle = 50;
  let oversold = 30;
  const lossAverage = indicator_ema();
  const gainAverage = indicator_ema();

  class indicator {
    constructor(data) {
      lossAverage.accessor(indicator.accessor()).period(p.period).init();
      gainAverage.accessor(indicator.accessor()).period(p.period).init();

      return data.map((d, i) => {
        if(i < 1) return datum(p.accessor.d(d));

        const difference = p.accessor(d) - p.accessor(data[i-1]);
        const averageGain = gainAverage.average(Math.max(difference, 0));
        const averageLoss = Math.abs(lossAverage.average(Math.min(difference, 0)));

        if(i >= p.period) {
          const rsi = 100 - (100/(1+(averageGain/averageLoss)));
          return datum(p.accessor.d(d), rsi, middle, overbought, oversold);
        }
        else return datum(p.accessor.d(d));
      }).filter(d => d.rsi !== null);
    }

    static overbought(_) {
      if (!arguments.length) return overbought;
      overbought = _;
      return indicator;
    }

    static middle(_) {
      if (!arguments.length) return middle;
      middle = _;
      return indicator;
    }

    static oversold(_) {
      if (!arguments.length) return oversold;
      oversold = _;
      return indicator;
    }
  }

  // Mixin 'superclass' methods and variables
  indicatorMixin(indicator, p)
    .accessor(accessor_ohlc())
    .period(14);

  return indicator;
};

function datum(date, rsi, middle, overbought, oversold) {
  if(rsi) return { date, rsi, middle, overbought, oversold };
  else return { date, rsi: null, middle: null, overbought: null, oversold: null };
}
