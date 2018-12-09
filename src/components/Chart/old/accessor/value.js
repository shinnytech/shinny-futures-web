export default () => {
  let date = d => d.date;

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

  let zero = d => d.zero;

  class accessor {
    constructor(d) {
      return accessor.v(d);
    }

    static date(_) {
      if (!arguments.length) return date;
      date = _;
      return bind();
    }

    static value(_) {
      if (!arguments.length) return value;
      value = _;
      return bind();
    }

    static zero(_) {
      if (!arguments.length) return zero;
      zero = _;
      return bind();
    }
  }

  function bind() {
    accessor.d = date;
    accessor.v = value;
    accessor.z = zero;

    return accessor;
  }

  return bind();
};
