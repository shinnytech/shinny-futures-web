export default () => {
  let date = d => d.date;
  let volume = d => d.volume;

  class accessor {
    constructor(d) {
      return accessor.v(d);
    }

    static date(_) {
      if (!arguments.length) return date;
      date = _;
      return bind();
    }

    static volume(_) {
      if (!arguments.length) return volume;
      volume = _;
      return bind();
    }
  }

  function bind() {
    accessor.d = date;
    accessor.v = volume;

    return accessor;
  }

  return bind();
};
