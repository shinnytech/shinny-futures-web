export default () => {
  let date = d => d.date;
  let williams = d => d.williams;

  class accessor {
    constructor(d) {
      return accessor.r(d);
    }

    static date(_) {
      if (!arguments.length) return date;
      date = _;
      return bind();
    }

    static williams(_) {
      if (!arguments.length) return williams;
      williams = _;
      return bind();
    }
  }

  function bind() {
    accessor.d = date;
    accessor.w = williams;

    return accessor;
  }

  return bind();
};
