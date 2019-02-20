export default () => {
  let date = d => d.date;
  let type = d => d.type;
  let price = d => d.price;

  class accessor {
    constructor(d) {
      return accessor.p(d);
    }

    static date(_) {
      if (!arguments.length) return date;
      date = _;
      return bind();
    }

    /**
     * A function which returns a string representing the type of this trade
     * @param _ A constant string or function which takes a data point and returns a string of valid classname format
     */
    static type(_) {
      if (!arguments.length) return type;
      type = _;
      return bind();
    }

    static price(_) {
      if (!arguments.length) return price;
      price = _;
      return bind();
    }
  }

  function bind() {
    accessor.d = date;
    accessor.t = type;
    accessor.p = price;

    return accessor;
  }

  return bind();
};
