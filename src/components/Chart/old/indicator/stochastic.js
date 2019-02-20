export default (indicatorMixin, accessor_ohlc) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  let period = 20;
  let periodD = 3;
  let overbought = 80;
  let middle = 50;
  let oversold = 20;

  class indicator {
    constructor(data) {
      const periodLength = (parseInt(period)+parseInt(periodD));
      return data.map((d, i) => {
        if(i >= periodLength ){
          const max = [];
          const min = [];
          const stochasticKBuffer = [];
          for (let per = 0; per < periodD; per++) {
            max.push(0);
            min.push(10000);
            stochasticKBuffer.push(0);
          }
          let stochasticD = 0;
          for (let k = 0; k < periodD; k++) {
            for (let j = 0; j < period; j++) {
              if(p.accessor.h(data[i-j-k]) > max[k]){
                max[k] = p.accessor.h(data[i-j-k]);
              }
              if(p.accessor.l(data[i-j-k]) < min[k]){
                min[k] = p.accessor.l(data[i-j-k]);
              }
            }
            const diff = (max[k]-min[k]);
            if(diff > 0) {
              stochasticKBuffer[k] = ((p.accessor.c(data[i - k]) - min[k]) / (max[k] - min[k])) * 100;
            }else{
              stochasticKBuffer[k] = 50;
            }
            stochasticD +=stochasticKBuffer[k];
          }
          const stochasticK =stochasticKBuffer[0];// ((d.close-min)/(max-min))*100;
          stochasticD /= periodD;
          return datum(p.accessor.d(d), stochasticK,stochasticD, middle, overbought, oversold);
        }
        else return datum(p.accessor.d(d), null, null, middle,overbought,oversold);
      }).filter(d => d.stochasticK);
    }

    static period(_) {
      if (!_) return period;
      period = _;
      return indicator;
    }

    static periodD(_) {
      if (!_) return periodD;
      periodD = _;
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

function datum(date, stochasticK,stochasticD, middle, overbought, oversold) {
  if(stochasticK) return { date, stochasticK,stochasticD, middle, overbought, oversold };
  else return { date, stochasticK: null,stochasticD:null, middle, overbought, oversold };
}
