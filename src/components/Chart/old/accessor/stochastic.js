export default () => {
  let date = d => d.date;
  let stochasticK = d => d.stochasticK;
  let stochasticD = d => d.stochasticD;
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

    static stochasticK(_) {
      if (!_) return stochasticK;
      stochasticK = _;
      return bind();
    }

    static stochasticD(_) {
      if (!_) return stochasticD;
      stochasticD = _;
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
    accessor.k = stochasticK;
    accessor.sd = stochasticD;
    accessor.ob = overbought;
    accessor.os = oversold;
    accessor.m = middle;

    return accessor;
  }

  return bind();
};
