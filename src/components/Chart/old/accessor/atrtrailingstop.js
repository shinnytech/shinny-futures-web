export default () => {
  let date = d => d.date;
  let up = d => d.up;
  let down = d => d.down;

  class accessor {
    constructor(d) {
      return accessor.up(d);
    }

    static date(_) {
      if (!_) return date;
      date = _;
      return bind();
    }

    static up(_) {
      if (!_) return up;
      up = _;
      return bind();
    }

    static down(_) {
      if (!_) return down;
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
