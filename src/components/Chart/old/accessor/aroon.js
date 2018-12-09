export default () => {
  let date = d => d.date;
  let up = d => d.up;
  let down = d => d.down;
  let oscillator = d => d.oscillator;
  let overbought = d => d.overbought;
  let oversold = d => d.oversold;
  let middle = d => d.middle;

  class accessor {
    constructor(d) {
      return accessor.r(d);
    }

    static date(_) {
      if (!arguments.length) return date;
      date = _;
      return bind();
    }

    static up(_) {
      if (!arguments.length) return up;
      up = _;
      return bind();
    }

    static down(_) {
      if (!arguments.length) return down;
      down = _;
      return bind();
    }

    static oscillator(_) {
      if (!arguments.length) return oscillator;
      oscillator = _;
      return bind();
    }

    static overbought(_) {
      if (!arguments.length) return overbought;
      overbought = _;
      return bind();
    }

    static oversold(_) {
      if (!arguments.length) return oversold;
      oversold = _;
      return bind();
    }

    static middle(_) {
      if (!arguments.length) return middle;
      middle = _;
      return bind();
    }
  }

  function bind() {
    accessor.d = date;
    accessor.up = up;
    accessor.down = down;
    accessor.oscillator = oscillator;
    accessor.ob = overbought;
    accessor.os = oversold;
    accessor.m = middle;

    return accessor;
  }

  return bind();
};
