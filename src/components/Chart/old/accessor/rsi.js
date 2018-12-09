export default () => {
  let date = d => d.date;
  let rsi = d => d.rsi;
  let overbought = d => d.overbought;
  let oversold = d => d.oversold;
  let middle = d => d.middle;

  class accessor {
    constructor(d) {
      return accessor.r(d);
    }

    static date(_) {
      if (!_) return date;
      date = _;
      return bind();
    }

    static rsi(_) {
      if (!_) return rsi;
      rsi = _;
      return bind();
    }

    static overbought(_) {
      if (!_) return overbought;
      overbought = _;
      return bind();
    }

    static oversold(_) {
      if (!_) return oversold;
      oversold = _;
      return bind();
    }

    static middle(_) {
      if (!_) return middle;
      middle = _;
      return bind();
    }
  }

  function bind() {
    accessor.d = date;
    accessor.r = rsi;
    accessor.ob = overbought;
    accessor.os = oversold;
    accessor.m = middle;

    return accessor;
  }

  return bind();
};
