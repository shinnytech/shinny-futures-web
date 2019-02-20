export default (indicatorMixin, accessor_ohlc, indicator_sma) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let period = 20;
  let sdMultiplication = 2;
  let sd;

  class indicator {
    constructor(data) {
      const signalLine = indicator_sma().accessor(indicator.accessor()).period(period).init();
      let j;
      return data.map((d, i) => {
        const middleBand = signalLine.average(p.accessor(d));
        if(i >= period) {
          let sum = 0;
          for(j = 0;j<period;j++){
            sum += ((p.accessor.c(data[i-j]) - middleBand) ** 2 );
          }
          sd = Math.sqrt( sum/period );
          const upperBand = middleBand+sdMultiplication*sd;
          const lowerBand = middleBand-sdMultiplication*sd;
          return datum(p.accessor.d(d), middleBand, upperBand, lowerBand);
        }
        else return datum(p.accessor.d(d));

      }).filter(d => d.middleBand);
    }

    static period(_) {
      if (!_) return period;
      period = _;
      return indicator;
    }

    static sdMultiplication(_) {
      if (!_) return sdMultiplication;
      sdMultiplication = _;
      return indicator;
    }
  }

  // Mixin 'superclass' methods and variables
  indicatorMixin(indicator, p).accessor(accessor_ohlc());

  return indicator;
};

function datum(date, middleBand, upperBand, lowerBand) {

  if(middleBand) return { date, middleBand, upperBand, lowerBand};
  else return { date, middleBand: null, upperBand: null, lowerBand: null};
}
