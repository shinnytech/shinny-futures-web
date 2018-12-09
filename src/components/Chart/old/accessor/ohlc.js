export default () => {
  let date = d => d.date;
  let open = d => d.open;
  let high = d => d.high;
  let low = d => d.low;
  let close = d => d.close;
  let volume = d => d.volume;

  function accessor (d) {
    return accessor.c(d);
  }

  accessor.date = (...args) => {
    if (args.length === 0) return date;
    date = args[0];
    return bind();
  }

  accessor.open = (...args) => {
    if (args.length === 0) return open;
    open = args[0];
    return bind();
  }

  accessor.high = (...args) => {
    if (args.length === 0) return high;
    high = args[0];
    return bind();
  }

  accessor.low = (...args) => {
    if (args.length === 0) return low;
    low = args[0];
    return bind();
  }

  accessor.close = (...args) => {
    if (args.length === 0) return close;
    close = args[0];
    return bind();
  }

  accessor.volume = (...args) => {
    if (args.length === 0) return volume;
    volume = args[0];
    return bind();
  }

  function bind() {
    accessor.d = date;
    accessor.o = open;
    accessor.h = high;
    accessor.l = low;
    accessor.c = close;
    accessor.v = volume;
    return accessor;
  }

  return bind();
};
