export default () => {
  let date = d => d.date;
  let macd = d => d.macd;
  const zero = d => d.zero;
  let signal = d => d.signal;
  let difference = d => d.difference;

  class accessor {
    constructor(d) {
      return accessor.m(d);
    }

    static date(_) {
      if (!arguments.length) return date;
      date = _;
      return bind();
    }

    static macd(_) {
      if (!arguments.length) return macd;
      macd = _;
      return bind();
    }

    static signal(_) {
      if (!arguments.length) return signal;
      signal = _;
      return bind();
    }

    static difference(_) {
      if (!arguments.length) return difference;
      difference = _;
      return bind();
    }
  }

  function bind() {
    accessor.d = date;
    accessor.m = macd;
    accessor.s = signal;
    accessor.dif = difference;
    accessor.z = zero;

    return accessor;
  }

  return bind();
};
