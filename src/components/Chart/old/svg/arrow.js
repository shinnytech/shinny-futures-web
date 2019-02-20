export default d3_functor => () => {
  let fx = d3_functor(0);
  let fy = d3_functor(0);
  let width = d3_functor(12);
  let height = d3_functor(15);
  let orient = d3_functor('up');
  let tail = d3_functor(true);

  class arrow {
    constructor(d, i) {
      let path; // Point Height
      const x = fx(d, i);
      const y = fy(d, i);
      const w = width(d, i);
      const h = height(d, i);
      const o = orient(d, i);
      const t = tail(d, i);
      const neg = o === 'left' || o === 'up' ? 1 : -1;

      const // Width Segment
        ws = w/3;

      const // Point width
        pw = w/2;

      const ph = t ? h/2 : h;

      path = `M ${x} ${y}`;

      switch(o) {
        case 'up':
        case 'down':
          path += ` l ${-pw} ${neg*ph} l ${ws} ${0}`;
          if(t) path += ` l ${0} ${neg*ph}`;
          path += ` l ${ws} ${0}`;
          if(t) path += ` l ${0} ${-neg*ph}`;
          path += ` l ${ws} ${0}`;
          break;

        case 'left':
        case 'right':
          path += ` l ${neg*ph} ${-pw} l ${0} ${ws}`;
          if(t) path += ` l ${neg*ph} ${0}`;
          path += ` l ${0} ${ws}`;
          if(t) path += ` l ${-neg*ph} ${0}`;
          path += ` l ${0} ${ws}`;
          break;

        default: throw `Unsupported arrow.orient() = ${orient}`;
      }

      return `${path} z`;
    }

    static x(_) {
      if(!arguments.length) return fx;
      fx = d3_functor(_);
      return arrow;
    }

    static y(_) {
      if(!arguments.length) return fy;
      fy = d3_functor(_);
      return arrow;
    }

    static height(_) {
      if(!arguments.length) return height;
      height = d3_functor(_);
      return arrow;
    }

    static width(_) {
      if(!arguments.length) return width;
      width = d3_functor(_);
      return arrow;
    }

    static orient(_) {
      if(!arguments.length) return orient;
      orient = d3_functor(_);
      return arrow;
    }

    static tail(_) {
      if(!arguments.length) return tail;
      tail = d3_functor(_);
      return arrow;
    }
  }

  return arrow;
};
