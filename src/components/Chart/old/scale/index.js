import _zoomable from './zoomable'
import util from '../util'
import accessors from '../accessor'
import _financetime from './financetime'

export default d3 => {
  const zoomable = _zoomable();
  const financetime = _financetime(d3.scaleLinear, d3, d3.bisect, util.rebindCallback, widen, zoomable);
  return {
    financetime,

    analysis: {
      supstance(data, accessor) {
        return d3.scaleLinear();
      },

      trendline(data, accessor) {
        return d3.scaleLinear();
      }
    },

    plot: {
      time(data, accessor=accessors.value()) {
        return financetime().domain(data.map(accessor.d));
      },

      atr(data, accessor=accessors.value()) {
        return pathScale(d3, data, accessor, 0.04);
      },

      ichimoku(data, accessor=accessors.ichimoku()) {
        // Lots of values in each data point, assemble them together as they are plotted considering offsets, flatten, remove nulls
        const values = mapReduceFilter(data, (d, i) => {
          const // Apply offset +pks (is plotted behind, so get data ahead)
            chikouSpanData = data[i+accessor.pks(d)]; // Apply offset -pks (is plotted in front, so get data behind)

          const senkouSpanBData = data[i-accessor.pks(d)];

          return [
            accessor.ts(d), accessor.ks(d),
            senkouSpanBData ? accessor.sa(senkouSpanBData) : null,
            senkouSpanBData ? accessor.sb(senkouSpanBData) : null,
            chikouSpanData ? accessor.c(chikouSpanData) : null
          ];
        });

        return d3.scaleLinear()
          .domain(d3.extent(values).map(widen(0.02)))
          .range([1, 0]);
      },

      percent(scale, reference) {
        const domain = scale.domain();
        reference = reference || domain[0];
        return scale.copy().domain([domain[0], domain[domain.length-1]].map(d => (d-reference)/reference));
      },

      ohlc(data, accessor=accessors.ohlc()) {
        return d3.scaleLinear()
          .domain([d3.min(data.map(accessor.low())), d3.max(data.map(accessor.high()))].map(widen(0.02)))
          .range([1, 0]);
      },

      volume(data, accessor=accessors.ohlc().v) {
        return d3.scaleLinear()
          .domain([0, d3.max(data.map(accessor))*1.15])
          .range([1, 0]);
      },

      atrtrailingstop(data, accessor=accessors.atrtrailingstop()) {
        const values = mapReduceFilter(data, d => [accessor.up(d), accessor.dn(d)]);
        return d3.scaleLinear().domain(d3.extent(values).map(widen(0.04)))
          .range([1, 0]);
      },

      rsi() {
        return d3.scaleLinear().domain([0, 100])
          .range([1, 0]);
      },

      momentum(data, accessor=accessors.value()) {
        return pathScale(d3, data, accessor, 0.04);
      },

      moneyflow(data, accessor=accessors.value()) {
        return pathScale(d3, data, accessor, 0.04);
      },

      macd(data, accessor=accessors.macd()) {
        return pathScale(d3, data, accessor, 0.04);
      },

      movingaverage(data, accessor=accessors.value()) {
        return pathScale(d3, data, accessor);
      },

      adx() {
        return d3.scaleLinear().domain([0, 100])
          .range([1, 0]);
      },

      aroon() {
        return d3.scaleLinear().domain([-100, 100])
          .range([1, 0]);
      },

      stochastic() {
        return d3.scaleLinear().domain([0, 100])
          .range([1, 0]);
      },

      williams() {
        return d3.scaleLinear().domain([0, 100])
          .range([1, 0]);
      },

      bollinger(data, accessor=accessors.bollinger()) {
        return d3.scaleLinear()
          .domain([
            d3.min(data.map(d => accessor.lower(d))),
            d3.max(data.map(d => accessor.upper(d)))
          ].map(widen(0.02)))
          .range([1, 0]);
      }
    },

    position: {

    }
  };
};

function pathDomain(d3, data, accessor, widening) {
  return data.length > 0 ? d3.extent(data, accessor).map(widen(widening)) : [];
}

function pathScale(d3, data, accessor, widening) {
  return d3.scaleLinear().domain(pathDomain(d3, data, accessor, widening))
    .range([1, 0]);
}

/**
 * Only to be used on an array of 2 elements [min, max]
 * @param padding
 * @param width
 * @returns {Function}
 */
function widen(widening=0, width) {
  return (d, i, array) => {
    if(array.length > 2) throw `array.length > 2 unsupported. array.length = ${array.length}`;
    width = width || (array[array.length-1] - array[0]);
    return d + (i*2-1)*width*widening;
  };
}

function mapReduceFilter(data, map) {
  return data.map(map)
    .reduce((a, b) => a.concat(b)) // Flatten
    .filter(d => d !== null); // Remove nulls
}
