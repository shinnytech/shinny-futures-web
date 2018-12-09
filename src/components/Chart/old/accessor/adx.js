export default () => {
  let date = d => d.date;
  let adx = d => d.adx;
  let plusDi = d => d.plusDi;
  let minusDi = d => d.minusDi;

  class accessor {
    constructor(d) {
      return accessor.r(d);
    }

    static date(_) {
      if (!_) return date;
      date = _;
      return bind();
    }

    static adx(_) {
      if (!_) return adx;
      adx = _;
      return bind();
    }

    static plusDi(_) {
      if (!_) return plusDi;
      plusDi = _;
      return bind();
    }

    static minusDi(_) {
      if (!_) return minusDi;
      minusDi = _;
      return bind();
    }
  }

  function bind() {
    accessor.d = date;
    accessor.adx = adx;
    accessor.plusDi = plusDi;
    accessor.minusDi = minusDi;

    return accessor;
  }

  return bind();
};
