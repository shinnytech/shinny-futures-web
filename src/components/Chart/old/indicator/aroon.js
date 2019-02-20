export default (indicatorMixin, accessor_ohlc) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let period = 20;
  let overbought = 70;
  let middle = 0;
  let oversold = 30;

  class indicator {
    constructor(data) {
      return data.map((d, i) => {
        if(i >= (period-1)){
          let max = 0;
          let maxi = 0;
          let min = 10000;
          let mini = 0;
          for (let j = 0; j < period; j++) {
            if( p.accessor.h(data[i-j]) > max){
              max = p.accessor.h(data[i-j]);
              maxi = j;
            }
            if( p.accessor.l(data[i-j]) < min){
              min = p.accessor.l(data[i-j]);
              mini = j;
            }
          }
          const up = ((period-maxi)/period)*100;
          const down = ((period-mini)/period)*100;
          const oscillator = up - down;
          return datum(p.accessor.d(d), up,down, oscillator, middle, overbought, oversold);
        }
        else return datum(p.accessor.d(d));
      }).filter(d => d.up);
    }

    static period(_) {
      if (!arguments.length) return period;
      period = _;
      return indicator;
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
  indicatorMixin(indicator, p).accessor(accessor_ohlc());

  return indicator;
};

function datum(date, up,down,oscillator, middle, overbought, oversold) {
  if(up) return { date, up,down,oscillator, middle, overbought, oversold };
  else return { date, up: null,down:null,oscillator:null, middle: null, overbought: null, oversold: null };
}
