export default () => {
  let startDate = function(d, _) {
    if(arguments.length < 2) return d.start.date;
    d.start.date = _;
  };

  let startValue = function(d, _) {
    if(arguments.length < 2) return d.start.value;
    d.start.value = _;
  };

  let endDate = function(d, _) {
    if(arguments.length < 2) return d.end.date;
    d.end.date = _;
  };

  let endValue = function(d, _) {
    if(arguments.length < 2) return d.end.value;
    d.end.value = _;
  };

  class accessor {
    constructor(d) {
      return accessor.sv(d);
    }

    static startDate(...args) {
      if (args.length === 0) return startDate;
      startDate = args[0];
      return bind();
    }

    static startValue(...args) {
      if (args.length === 0) return startValue;
      startValue = args[0];
      return bind();
    }

    static endDate(...args) {
      if (args.length === 0) return endDate;
      endDate = args[0];
      return bind();
    }

    static endValue(...args) {
      if (args.length === 0) return endValue;
      endValue = args[0];
      return bind();
    }
  }

  function bind() {
    accessor.sd = startDate;
    accessor.sv = startValue;
    accessor.ed = endDate;
    accessor.ev = endValue;

    return accessor;
  }

  return bind();
};
