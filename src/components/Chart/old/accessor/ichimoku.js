export default () => {
  let date = d => d.date;  // Parameter: Senkou Span B Period, Offset

  let // Conversion line
    tenkanSen = d => d.tenkanSen;

  let // Base Line
    kijunSen = d => d.kijunSen;

  let // Leading Span A
    senkouSpanA = d => d.senkouSpanA;

  let // Leading Span B
    senkouSpanB = d => d.senkouSpanB;

  let // Lagging Span
    chikouSpan = d => d.chikouSpan;

  let // Functions to get to the parameters
    // Parameter: Conversion Line Period
    ptenanSen = d => d.parameters.tenkanSen;

  let // Parameter: Base Line Period, Offset
    pkijunSen = d => d.parameters.kijunSen;

  let psenkouSpanB = d => d.parameters.senkouSpanB;

  class accessor {
    constructor(d) {
      return accessor.ts(d);
    }

    static date(_) {
      if (!arguments.length) return date;
      date = _;
      return bind();
    }

    static tenkanSen(_) {
      if (!arguments.length) return tenkanSen;
      tenkanSen = _;
      return bind();
    }

    static kijunSen(_) {
      if (!arguments.length) return kijunSen;
      kijunSen = _;
      return bind();
    }

    static senkouSpanA(_) {
      if (!arguments.length) return senkouSpanA;
      senkouSpanA = _;
      return bind();
    }

    static senkouSpanB(_) {
      if (!arguments.length) return senkouSpanB;
      senkouSpanB = _;
      return bind();
    }

    static chikouSpan(_) {
      if (!arguments.length) return chikouSpan;
      chikouSpan = _;
      return bind();
    }

    static ptenanSen(_) {
      if (!arguments.length) return ptenanSen;
      ptenanSen = _;
      return bind();
    }

    static pkijunSen(_) {
      if (!arguments.length) return pkijunSen;
      pkijunSen = _;
      return bind();
    }

    static psenkouSpanB(_) {
      if (!arguments.length) return psenkouSpanB;
      psenkouSpanB = _;
      return bind();
    }
  }

  function bind() {
    accessor.d = date;
    accessor.ts = tenkanSen;
    accessor.ks = kijunSen;
    accessor.sa = senkouSpanA;
    accessor.sb = senkouSpanB;
    accessor.c = chikouSpan;
    accessor.pts = ptenanSen;
    accessor.pks = pkijunSen;
    accessor.pssb = psenkouSpanB;

    return accessor;
  }

  return bind();
};
