export default (
  d3_behavior_drag,
  d3_event,
  d3_select,
  d3_dispatch,
  accessor_trendline,
  plot,
  plotMixin) => {  // Injected dependencies
  function Trendline() {
    // Closure function
    const // Container for private, direct access mixed in variables
      p = {};

    const dispatch = d3_dispatch('mouseenter', 'mouseout', 'mousemove', 'drag', 'dragstart', 'dragend');

    class trendline {
      constructor(g) {
        const group = p.dataSelector(g);
        const trendlineGroup = group.entry.append('g').attr('class', 'trendline');

        trendlineGroup.append('path').attr('class', 'body');
        trendlineGroup.append('circle').attr('class', 'start').attr('r', 1);
        trendlineGroup.append('circle').attr('class', 'end').attr('r', 1);

        const interaction = group.entry.append('g').attr('class', 'interaction').style('opacity', 0).style('fill', 'none')
          .call(plot.interaction.mousedispatch(dispatch));

        interaction.append('path').attr('class', 'body').style('stroke-width', '16px');
        interaction.append('circle').attr('class', 'start').attr('r', 8);
        interaction.append('circle').attr('class', 'end').attr('r', 8);

        trendline.refresh(g);
      }

      static refresh(g) {
        refresh(p.dataSelector.select(g), p.accessor, p.xScale, p.yScale);
      }

      static drag(g) {
        g.selectAll('.interaction circle.start')
          .call(dragEnd(dispatch, p.accessor, p.accessor.sd, p.xScale, p.accessor.sv, p.yScale));
        g.selectAll('.interaction circle.end')
          .call(dragEnd(dispatch, p.accessor, p.accessor.ed, p.xScale, p.accessor.ev, p.yScale));
        g.selectAll('.interaction path.body')
          .call(dragBody(dispatch, p.accessor, p.xScale, p.yScale));
      }
    }

    // Mixin 'superclass' methods and variables
    plotMixin(trendline, p)
      .dataSelector(plotMixin.dataMapper.unity)
      .plot(accessor_trendline())
      .on(dispatch);

    return trendline;
  }

  function dragEnd(dispatch, accessor, accessor_x, x, accessor_y, y) {
    const drag = d3_behavior_drag();

    drag.subject(d => ({
      x: x(accessor_x(d)),
      y: y(accessor_y(d))
    }))
      .on('drag', function(d) {
        updateEnd(accessor_x, x, d3_event().x, accessor_y, y, d3_event().y, d);
        refresh(d3_select(this.parentNode.parentNode.parentNode), accessor, x, y);
        dispatch.call('drag', this, d);
      });

    return plot.interaction.dragStartEndDispatch(drag, dispatch);
  }

  function dragBody(dispatch, accessor, x, y) {
    const // State information, grabs the start coords of the line
      dragStart = {};

    const drag = d3_behavior_drag();

    drag.subject(d => {
      dragStart.start = { date: x(accessor.sd(d)), value: y(accessor.sv(d)) };
      dragStart.end = { date: x(accessor.ed(d)), value: y(accessor.ev(d)) };
      return { x: 0, y: 0 };
    })
      .on('drag', function(d) {
        updateEnd(accessor.sd, x, d3_event().x + dragStart.start.date,
          accessor.sv, y, d3_event().y + dragStart.start.value,
          d);
        updateEnd(accessor.ed, x, d3_event().x + dragStart.end.date,
          accessor.ev, y, d3_event().y + dragStart.end.value,
          d);
        refresh(d3_select(this.parentNode.parentNode.parentNode), accessor, x, y);
        dispatch.call('drag', this, d);
      });

    return plot.interaction.dragStartEndDispatch(drag, dispatch);
  }

  function updateEnd(accessor_x, x, xValue, accessor_y, y, yValue, d) {
    const date = x.invert(xValue);
    if(date !== null && date !== undefined) accessor_x(d, date);
    accessor_y(d, y.invert(yValue));
  }

  return Trendline;
};

function refresh(selection, accessor, x, y) {
  selection.selectAll('path.body').attr('d', trendlinePath(accessor, x, y));
  selection.selectAll('circle.start').attr('cx', trendlineEndCX(accessor.sd, x)).attr('cy', trendlineEndCY(accessor.sv, y));
  selection.selectAll('circle.end').attr('cx', trendlineEndCX(accessor.ed, x)).attr('cy', trendlineEndCY(accessor.ev, y));
}

function trendlinePath(accessor, x, y) {
  return d => `M ${x(accessor.sd(d))} ${y(accessor.sv(d))} L ${x(accessor.ed(d))} ${y(accessor.ev(d))}`;
}

function trendlineEndCX(accessor_x, x) {
  return d => x(accessor_x(d));
}

function trendlineEndCY(accessor_y, y) {
  return d => y(accessor_y(d));
}
