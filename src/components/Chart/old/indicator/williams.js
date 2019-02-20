export default (indicatorMixin, accessor_ohlc) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let period = 20;
  let overbought = 80;
  let middle = 50;
  let oversold = 20;

  class indicator {
    constructor(data) {
      return data.map((d, i) => {
        if(i >= period){
          let max = 0;
          let maxi = 0;
          let min = 10000;
          let mini = 0;
          for (let j = 0; j < period; j++) {
            if(p.accessor.h(data[i-j]) > max){
              max = p.accessor.h(data[i-j]);
              maxi = j;
            }
            if(p.accessor.l(data[i-j]) < min){
              min = p.accessor.l(data[i-j]);
              mini = j;
            }
          }
          const williams = ((p.accessor.c(data[i]) - min )/( max - min ))*100;
          return datum(p.accessor.d(d), williams, middle, overbought, oversold);
        }
        else return datum(p.accessor.d(d));
      }).filter(d => d.williams);
    }

    static period(_) {
      if (!arguments.length) return period;
      period = _;
      return indicator;
    }

    static overbought(_) {
      if (!_) return overbought;
      overbought = _;
      return indicator;
    }

    static middle(_) {
      if (!_) return middle;
      middle = _;
      return indicator;
    }

    static oversold(_) {
      if (!_) return oversold;
      oversold = _;
      return indicator;
    }
  }

  // Mixin 'superclass' methods and variables
  indicatorMixin(indicator, p).accessor(accessor_ohlc());

  return indicator;
};

function datum(date, williams, middle, overbought, oversold) {
  if(williams) return { date, williams, middle, overbought, oversold };
  else return { date, williams: null, middle: null, overbought: null, oversold: null };
}
