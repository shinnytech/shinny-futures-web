import Plot from './plot'
import CandlePlot from './candlestick'
import OhlcPlot from './ohlc'
export {
  Plot,
  CandlePlot,
  OhlcPlot
}

// import _scale from '../scale'
// import accessor from '../accessor'
// import _plot from './plot'
// import util from '../util'
// import _plotmixin from './plotmixin'
// import _candlestick from './candlestick'
// import _line from './line'
// import _axisannotation from './axisannotation'
// import _svg from '../svg'
//
// import _tradearrow from './tradearrow'
// import _atrtrailingstop from './atrtrailingstop'
// import _crosshair from './crosshair'
// import _ichimoku from './ichimoku'
// import _ohlc from './ohlc'
// import _tick from './tick'
// import _volume from './volume'
// import _rsi from './rsi'
// import _macd from './macd'
// import _supstance from './supstance'
// import _trendline from './trendline'
// import _adx from './adx'
// import _aroon from './aroon'
// import _stochastic from './stochastic'
// import _williams from './williams'
// import _bollinger from './bollinger'
//
// export default (d3) => {
//   const scale = _scale(d3);
//   const plot = _plot(d3.line, d3.area, d3.curveMonotoneX, d3.select);
//   const plotMixin = _plotmixin(d3.scaleLinear, util.functor, scale.financetime, plot.dataSelector, plot.barWidth);
//   const candlestick = _candlestick(d3.scaleLinear, d3.extent, accessor.ohlc, plot, plotMixin);
//   const line = _line
//   const axisannotation = _axisannotation(d3.axisTop, d3.scaleLinear, accessor.value, plot, plotMixin);
//   const svg = _svg(d3);
//
//   function d3_event() {
//     return d3.event;
//   }
//
//   return {
//     tradearrow: _tradearrow(d3.select, util.functor, d3.mouse, d3.dispatch, accessor.trade, plot, plotMixin, svg.arrow),
//     atr: line(accessor.value, plot, plotMixin),
//     atrtrailingstop: _atrtrailingstop(accessor.atrtrailingstop, plot, plotMixin),
//     axisannotation,
//     candlestick,
//     crosshair: _crosshair(d3.select, d3_event, d3.mouse, d3.dispatch, accessor.crosshair, plot, plotMixin),
//     ema: line(accessor.value, plot, plotMixin),
//     heikinashi: candlestick,
//     ichimoku: _ichimoku(d3.area, d3.curveMonotoneX, accessor.ichimoku, plot, plotMixin),
//     ohlc: _ohlc(d3.scaleLinear, d3.extent, accessor.ohlc, plot, plotMixin),
//     tick: _tick(d3.scaleLinear, d3.extent, accessor.tick, plot, plotMixin),
//     close: line(accessor.ohlc, plot, plotMixin),
//     volume: _volume(accessor.volume, plot, plotMixin),
//     rsi: _rsi(accessor.rsi, plot, plotMixin),
//     macd: _macd(accessor.macd, plot, plotMixin),
//     momentum: line(accessor.value, plot, plotMixin, true),
//     moneyflow: line(accessor.value, plot, plotMixin, true),
//     sma: line(accessor.value, plot, plotMixin),
//     supstance: _supstance(d3.drag, d3_event, d3.select, d3.dispatch, accessor.supstance, plot, plotMixin),
//     trendline: _trendline(d3.drag, d3_event, d3.select, d3.dispatch, accessor.trendline, plot, plotMixin),
//     wilderma: line(accessor.value, plot, plotMixin),
//     adx: _adx(accessor.adx, plot, plotMixin),
//     aroon: _aroon(accessor.aroon, plot, plotMixin),
//     stochastic: _stochastic(accessor.stochastic, plot, plotMixin),
//     williams: _williams(accessor.williams, plot, plotMixin),
//     bollinger: _bollinger(accessor.bollinger, plot, plotMixin),
//     vwap: line(accessor.value, plot, plotMixin)
//   };
// };
