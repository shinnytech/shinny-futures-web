// import d3 from 'd3'
import indicatorMixin from './indicatormixin'
import accessor from '../accessor'
import _ema_init from './ema'
import _sma from './sma'
import _atr from './atr'
import _vwap from './vwap'

const ema = _ema_init(indicatorMixin, accessor.ohlc, ema_alpha_init);
const sma = _sma(indicatorMixin, accessor.ohlc)
const atr = _atr(indicatorMixin, accessor.ohlc, sma);
const vwap = _vwap(indicatorMixin, accessor.ohlc);

import _atrtrailingstop from './atrtrailingstop'
import _heikinashi from './heikinashi'
import _ichimoku from './ichimoku'
import _macd from './macd'
import _rsi from './rsi'
import _aroon from './aroon'
import _stochastic from './stochastic'
import _williams from './williams'
import _adx from './adx'
import _bollinger from './bollinger'

export default (d3) => {
  return {
    atr,
    atrtrailingstop: _atrtrailingstop(indicatorMixin, accessor.ohlc, atr),
    ema,
    heikinashi: _heikinashi(indicatorMixin, accessor.ohlc, d3.min, d3.max),
    ichimoku: _ichimoku(indicatorMixin, accessor.ohlc),
    macd: _macd(indicatorMixin, accessor.ohlc, ema),
    rsi: _rsi(indicatorMixin, accessor.ohlc, ema),
    sma,
    wilderma: _ema_init(indicatorMixin, accessor.ohlc, wilder_alpha_init),
    aroon: _aroon(indicatorMixin, accessor.ohlc),
    stochastic: _stochastic(indicatorMixin, accessor.ohlc, ema),
    williams: _williams(indicatorMixin, accessor.ohlc, ema),
    adx: _adx(d3.max, indicatorMixin, accessor.ohlc, ema),
    bollinger: _bollinger(indicatorMixin, accessor.ohlc, sma),
    vwap
  };
};

function ema_alpha_init(period) {
  return 2/(period+1);
}

function wilder_alpha_init(period) {
  return 1/period;
}
