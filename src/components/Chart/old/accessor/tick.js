export default () => {
  let date = d => d.date;
  let high = d => d.high;
  let low = d => d.low;
  let spread = d => d.spread;

  class accessor {
    constructor(d) {
      bind();
    }

    static date(_) {
      if (!_) return date;
      date = _;
      return bind();
    }

    static high(_) {
      if (!_) return high;
      high = _;
      return bind();
    }

    static low(_) {
      if (!_) return low;
      low = _;
      return bind();
    }

    static spread(_) {
      if (!_) return spread;
      spread = _;
      return bind();
    }
  }

  function bind() {
    accessor.d = date;
    accessor.h = high;
    accessor.l = low;
    accessor.s = spread;

    return accessor;
  }

  return bind();
};
