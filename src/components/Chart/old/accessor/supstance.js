export default () => {
  let start = d => d.start;
  let end = d => d.end;

  let /**
   * Supports getter and setter
   * @param d Underlying data object to get or set the value
   * @param _ If passed turns into a setter. This is the value to set
   * @returns {*}
   */
  value = function(d, _) {
    if(arguments.length < 2) return d.value;
    d.value = _;
    return accessor;
  };

  class accessor {
    constructor(d) {
      return accessor.v(d);
    }

    static start(_) {
      if (!arguments.length) return start;
      start = _;
      return bind();
    }

    static end(_) {
      if (!arguments.length) return end;
      end = _;
      return bind();
    }

    static value(_) {
      if (!arguments.length) return value;
      value = _;
      return bind();
    }
  }

  function bind() {
    accessor.s = start;
    accessor.e = end;
    accessor.v = value;

    return accessor;
  }

  return bind();
};
