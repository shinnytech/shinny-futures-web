/**
 * TODO Refactor this to techan.plot.annotation.axis()?
 */

/* eslint-disable */
/* no-case-declarations */
export default (d3_svg_axis, d3_scale_linear, accessor_value, plot, plotMixin) => () => {
  // Closure function
  const p = {};

  let axis = d3_svg_axis(d3_scale_linear());
  let format;
  const point = 4;
  let height = 14;
  let width = 50;
  let translate = [0, 0];
  let orient = 'bottom';

  class annotation {
    constructor(g) {
      const group = p.dataSelector.mapper(filterInvalidValues(p.accessor, axis.scale()))(g);

      group.entry.append('path');
      group.entry.append('text');

      annotation.refresh(g);
    }

    static refresh(g) {
      const fmt = format ? format : (axis.tickFormat() ? axis.tickFormat() : axis.scale().tickFormat());
      refresh(p.dataSelector.select(g), p.accessor, axis, orient, fmt, height, width, point, translate);
    }

    static axis(_) {
      if(!arguments.length) return axis;
      axis = _;
      return annotation;
    }

    static orient(_) {
      if(!arguments.length) return orient;
      orient = _;
      return annotation;
    }

    static format(_) {
      if(!arguments.length) return format;
      format = _;
      return annotation;
    }

    static height(_) {
      if(!arguments.length) return height;
      height = _;
      return annotation;
    }

    static width(_) {
      if(!arguments.length) return width;
      width = _;
      return annotation;
    }

    static translate(_) {
      if(!arguments.length) return translate;
      translate = _;
      return annotation;
    }
  }

  plotMixin(annotation, p).accessor(accessor_value()).dataSelector();

  return annotation;
};

function refresh(selection, accessor, axis, orient, format, height, width, point, translate) {
  const neg = orient === 'left' || orient === 'top' ? -1 : 1;

  selection.attr('transform', `translate(${translate[0]},${translate[1]})`);
  selection.select('path').attr('d', backgroundPath(accessor, axis, orient, height, width, point, neg));
  selection.select('text').text(textValue(accessor, format)).call(textAttributes, accessor, axis, orient, neg);
}

function filterInvalidValues(accessor, scale) {
  return data => {
    let range = scale.range();
    const start = range[0];
    const end = range[range.length - 1];

    range = start < end ? [start, end] : [end, start];

    return data.filter(d => {
      if (accessor(d) === null || accessor(d) === undefined) return false;
      const value = scale(accessor(d));
      return value !== null && !isNaN(value) && range[0] <= value && value <= range[1];
    });
  };
}

function textAttributes(text, accessor, axis, orient, neg) {
  const scale = axis.scale();

  switch(orient) {
    case 'left':
    case 'right':
      text.attr('x', neg*(Math.max(axis.tickSizeInner(), 0) + axis.tickPadding()))
        .attr('y', textPosition(accessor, scale))
        .attr('dy', '.32em')
        .style('text-anchor', neg < 0 ? 'end' : 'start');
      break;
    case 'top':
    case 'bottom':
      text.attr('x', textPosition(accessor, scale))
        .attr('y', neg*(Math.max(axis.tickSizeInner(), 0) + axis.tickPadding()))
        .attr('dy', neg < 0 ? '0em' : '.72em')
        .style('text-anchor', 'middle');
      break;
  }
}

function textPosition(accessor, scale) {
  return d => scale(accessor(d));
}

function textValue(accessor, format) {
  return d => format(accessor(d));
}

function backgroundPath(accessor, axis, orient, height, width, point, neg) {
  return d => {
    const scale = axis.scale();
    const value = scale(accessor(d));
    let pt = point;

    switch(orient) {
      case 'left':
      case 'right':
        let h = 0;

        if(height/2 < point) pt = height/2;
        else h = height/2-point;

        return `M 0 ${value} l ${neg*Math.max(axis.tickSizeInner(), 1)} ${-pt} l 0 ${-h} l ${neg*width} 0 l 0 ${height} l ${neg*-width} 0 l 0 ${-h}`;
      case 'top':
      case 'bottom':
        let w = 0;

        if(width/2 < point) pt = width/2;
        else w = width/2-point;

        return `M ${value} 0 l ${-pt} ${neg*Math.max(axis.tickSizeInner(), 1)} l ${-w} 0 l 0 ${neg*height} l ${width} 0 l 0 ${neg*-height} l ${-w} 0`;
      default: throw `Unsupported orient value: axisannotation.orient(${orient}). Set to one of: 'top', 'bottom', 'left', 'right'`;
    }
  };
}
