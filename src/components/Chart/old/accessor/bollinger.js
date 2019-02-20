export default () => {
  let date = d => d.date;
  let up = d => d.up;
  let down = d => d.down;

  class accessor {
    constructor(d) {
      return accessor.up(d);
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
  }

  function bind() {
    accessor.d = date;
    accessor.up = up;
    accessor.dn = down;

    return accessor;
  }

  return bind();
};
