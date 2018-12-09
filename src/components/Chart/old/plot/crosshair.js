export default (
  d3_select,
  d3_event,
  d3_mouse,
  d3_dispatch,
  accessor_crosshair,
  plot,
  plotMixin) => () => {
  // Closure function
  const // Container for private, direct access mixed in variables
    p = {};

  const dispatcher = d3_dispatch('enter', 'out', 'move');
  let verticalPathGenerator;
  let horizontalPathGenerator;
  const xAnnotationComposer = plot.plotComposer().scope('composed-annotation').plotScale(plot => plot.axis().scale());
  const yAnnotationComposer = plot.plotComposer().scope('composed-annotation').plotScale(plot => plot.axis().scale());
  let verticalWireRange;
  let horizontalWireRange;

  class crosshair {
    constructor(g) {
      const group = p.dataSelector(g);

      group.entry.append('path').attr('class', 'horizontal wire');
      group.entry.append('path').attr('class', 'vertical wire');

      group.entry.append('g').attr('class', 'axisannotation x').call(xAnnotationComposer);
      group.entry.append('g').attr('class', 'axisannotation y').call(yAnnotationComposer);

      g.selectAll('rect').data([undefined]).enter().append('rect').style('fill', 'none').style('pointer-events', 'all');

      crosshair.refresh(g);
    }

    static refresh(g) {
      const xRange = p.xScale.range();
      const yRange = p.yScale.range();
      const group = p.dataSelector.select(g);
      const pathVerticalSelection = group.select('path.vertical');
      const pathHorizontalSelection = group.select('path.horizontal');
      const xAnnotationSelection = group.select('g.axisannotation.x');
      const yAnnotationSelection = group.select('g.axisannotation.y');

      g.selectAll('rect')
        .attr('x', Math.min.apply(null, xRange))
        .attr('y', Math.min.apply(null, yRange))
        .attr('height', Math.abs(yRange[yRange.length-1] - yRange[0]))
        .attr('width', Math.abs(xRange[xRange.length-1] - xRange[0]))
        .on('mouseenter', function() {
          dispatcher.call('enter', this);
        })
        .on('mouseout', function() {
          dispatcher.call('out', this);
          // Redraw with null values to ensure when we enter again, there is nothing cached when redisplayed
          delete group.node().__coord__;
          initialiseWire(group.datum()); // Mutating data, don't need to manually pass down
          refresh(group, pathVerticalSelection, pathHorizontalSelection, xAnnotationSelection, yAnnotationSelection);
        })
        .on('mousemove', mousemoveRefresh(group, pathVerticalSelection, pathHorizontalSelection,
          xAnnotationSelection, yAnnotationSelection)
        );

      refresh(group, pathVerticalSelection, pathHorizontalSelection, xAnnotationSelection, yAnnotationSelection);
    }

    static xAnnotation(_) {
      if(!arguments.length) return xAnnotationComposer.plots();
      xAnnotationComposer.plots(_ instanceof Array ? _ : [_]);
      return binder();
    }

    static yAnnotation(_) {
      if(!arguments.length) return yAnnotationComposer.plots();
      yAnnotationComposer.plots(_ instanceof Array ? _ : [_]);
      return binder();
    }

    static verticalWireRange(_) {
      if(!arguments.length) return verticalWireRange;
      verticalWireRange = _;
      return binder();
    }

    static horizontalWireRange(_) {
      if(!arguments.length) return horizontalWireRange;
      horizontalWireRange = _;
      return binder();
    }
  }

  function mousemoveRefresh(selection, pathVerticalSelection, pathHorizontalSelection,
                            xAnnotationSelection, yAnnotationSelection) {
    return function() {
      // Cache coordinates past this mouse move
      selection.node().__coord__ = d3_mouse(this);
      refresh(selection, pathVerticalSelection, pathHorizontalSelection, xAnnotationSelection, yAnnotationSelection);
    };
  }

  function refresh(selection, xPath, yPath, xAnnotationSelection, yAnnotationSelection) {
    const coords = selection.node().__coord__;

    if(coords !== undefined) {
      const d = selection.datum();
      const xNew = p.xScale.invert(coords[0]);
      const yNew = p.yScale.invert(coords[1]);
      const dispatch = xNew !== null && yNew !== null && (p.accessor.xv(d) !== xNew || p.accessor.yv(d) !== yNew);

      p.accessor.xv(d, xNew);
      p.accessor.yv(d, yNew);
      if(dispatch) dispatcher.call('move', selection.node(), d);
    }

    // Just before draw, convert the coords to
    xPath.attr('d', verticalPathGenerator);
    yPath.attr('d', horizontalPathGenerator);
    xAnnotationSelection.call(xAnnotationComposer.refresh);
    yAnnotationSelection.call(yAnnotationComposer.refresh);
    selection.attr('display', displayAttr);
  }

  function binder() {
    verticalPathGenerator = verticalPathLine();
    horizontalPathGenerator = horizontalPathLine();
    xAnnotationComposer.accessor(p.accessor.xv).scale(p.xScale);
    yAnnotationComposer.accessor(p.accessor.yv).scale(p.yScale);
    return crosshair;
  }

  function horizontalPathLine() {
    const range = horizontalWireRange || p.xScale.range();

    return d => {
      if(p.accessor.yv(d) === null) return null;
      const value = p.yScale(p.accessor.yv(d));
      if(isNaN(value)) return null;
      return `M ${range[0]} ${value} L ${range[range.length-1]} ${value}`;
    };
  }

  function verticalPathLine() {
    const range = verticalWireRange || p.yScale.range();

    return d => {
      if(p.accessor.xv(d) === null) return null;
      const value = p.xScale(p.accessor.xv(d));
      const sr = p.xScale.range();
      if(value < Math.min(sr[0], sr[sr.length-1]) || value > Math.max(sr[0], sr[sr.length-1])) return null;
      return `M ${value} ${range[0]} L ${value} ${range[range.length-1]}`;
    };
  }

  function initialiseWire(d={}) {
    p.accessor.xv(d, null);
    p.accessor.yv(d, null);
    return d;
  }

  function isEmpty(d) {
    return d === undefined || p.accessor.xv(d) === null || p.accessor.yv(d) === null;
  }

  function displayAttr(d) {
    return isEmpty(d) ? 'none' : null;
  }

  // Mixin scale management and event listening
  plotMixin(crosshair, p).plot(accessor_crosshair(), binder)
    .dataSelector(d => {
      // Has the user set data? If not, put empty data ready for mouse over
      if(isEmpty(d)) return [ initialiseWire() ];
      else return [d];
    })
    .on(dispatcher);

  p.dataSelector.scope('crosshair');

  return binder();
};
