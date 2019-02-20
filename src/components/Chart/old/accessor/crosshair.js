export default () => {
  /**
   * Supports getter and setter. Watch out if used in d3 and the second parameter is an index!!
   * This approach needs further thought.
   * @param d Underlying data object to get or set the value
   * @param _ If passed turns into a setter. This is the value to set
   * @returns {*}
   */
  let x = function(d, _) {
    if(arguments.length < 2) return d.x;
    d.x = _;
    return accessor;
  };

  let /**
   * Supports getter and setter. Watch out if used in d3 and the second parameter is an index!!
   * This approach needs further thought.
   * @param d Underlying data object to get or set the value
   * @param _ If passed turns into a setter. This is the value to set
   * @returns {*}
   */
  y = function(d, _) {
    if(arguments.length < 2) return d.y;
    d.y = _;
    return accessor;
  };

  class accessor {
    constructor(d) {
      return accessor.xv(d);
    }

    static x(...args) {
      if (!args.length) return x;
      x = args[0];
      return bind();
    }

    static y(...args) {
      if (!args.length) return y;
      y = args[0];
      return bind();
    }
  }

  function bind() {
    accessor.xv = x;
    accessor.yv = y;

    return accessor;
  }

  return bind();
};
