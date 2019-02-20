import {
  line as d3_svg_line,
  area as d3_svg_area,
  curveMonotoneX as d3_line_interpolate,
  select as d3_select
}
  from 'd3'

// d3_svg_line _plot(d3.line, d3.area, d3.curveMonotoneX, d3.select);
// d3_svg_line, d3_svg_area, d3_line_interpolate, d3_select

export default () => {
  const DataSelector = mapper => {
    let key;
    let scope;
    let classes = ['data'];

    function dataSelect(g) {
      const selection = dataSelect.select(g).data(mapper, key);
      const entry = selection.enter().append('g').attr('class', arrayJoin(classes, ' '));
      selection.exit().remove();

      return {
        entry,
        selection: entry.merge(selection)
      };
    }

    dataSelect.select = (g) => {
      return g.selectAll(`g.${arrayJoin(classes, '.')}`);
    }

    /**
     * DataSelector.mapper.unity, DataSelector.mapper.array, or custom data mapper
     * @param _
     * @returns {*}
     */
    dataSelect.mapper = (...args) => {
      if (args.length === 0) return mapper;
      mapper = args[0]
      return dataSelect;
    }

    dataSelect.scope = (...args) => {
      if (args.length === 0) return scope;
      scope = args[0]
      classes = ['data', `scope-${scope}`];
      return dataSelect;
    }

    dataSelect.key = (...args) => {
      if (args.length === 0) return key;
      key = args[0]
      return dataSelect;
    }

    return dataSelect;
  };

  DataSelector.mapper = {
    unity(d) {
      return d;
    },
    array(d) {
      return [d];
    }
  };

  function PathLine() {
    const d3Line = d3_svg_line().curve(d3_line_interpolate);

    const line = (data) => d3Line(data)

    line.init = (accessor_date, x, accessor_value, y, offset) => {
      return d3Line.defined(d => accessor_value(d) !== null)
        .x(d => x(accessor_date(d), offset === undefined ? offset : offset(d)))
        .y(d => y(accessor_value(d)));
    }

    line.d3 = () => {
      return d3Line;
    }

    return line;
  }

  function PathArea() {
    const d3Area = d3_svg_area().curve(d3_line_interpolate);

    class area {
      constructor(data) {
        return d3Area(data);
      }

      static init(accessor_date, x, accessor_value, y, yBase) {
        return d3Area.defined(d => accessor_value(d) !== null)
          .x(d => x(accessor_date(d)))
          .y0(d => y(yBase))
          .y1(d => y(accessor_value(d)));
      }

      static d3() {
        return d3Area;
      }
    }

    return area;
  }

  function upDownEqual(accessor) {
    return {
      up(d) {
        return accessor.o(d) < accessor.c(d);
      },
      down(d) {
        return accessor.o(d) > accessor.c(d);
      },
      equal(d) {
        return accessor.o(d) === accessor.c(d);
      }
    };
  }

  function appendPathsGroupBy(g, accessor, plotName, classes) {
    const plotNames = plotName instanceof Array ? plotName : [plotName];

    classes = classes || upDownEqual(accessor);

    Object.keys(classes).forEach(key => {
      appendPlotTypePath(g, classes[key], plotNames, key);
    });
  }

  function appendPathsUpDownEqual(g, accessor, plotName) {
    appendPathsGroupBy(g, accessor, plotName, upDownEqual(accessor));
  }

  function appendPlotTypePath(g, data, plotNames, direction) {
    g.selectAll(`path.${arrayJoin(plotNames, '.')}.${direction}`).data(d => [d.filter(data)])
      .enter().append('path').attr('class', `${arrayJoin(plotNames, ' ')} ${direction}`);
  }

  function barWidth(x) {
    if (x.band !== undefined) return Math.max(x.band(), 1);
    else return 3; // If it's not a finance time, the user should specify the band calculation (or constant) on the plot
  }

  function arrayJoin(array, delimiter) {
    if (!array.length) return;
    let result = array[0];
    for (let i = 1; i < array.length; i++) {
      result += delimiter + array[i];
    }
    return result;
  }


  /**
   * Helper class assists the composition of multiple techan plots. Handles:
   * - Automatic transfer of data down to descendants
   * - Automatic scaling of a value to the child ( value (parent) -> percent conversion for example)
   * - Plots must be of the same type, ie. Axis Annotation, Supstance)
   *
   * @returns {plotComposer} An instance
   * @constructor
   */
  function PlotComposer() {
    const dataSelector = DataSelector();
    let plots = [];
    let plotScale = plot => plot.scale();
    let scale;
    let accessor;

    class plotComposer {
      constructor(g) {
        const group = dataSelector.mapper(() => plots.map(() => []))(g);

        group.selection.each(function (d, i) {
          plots[i](d3_select(this));
        });

        plotComposer.refresh(g);
      }

      static refresh(g) {
        dataSelector.select(g).data(d => {
          const value = accessor(d);
          if (value === null || value === undefined) return plots.map(() => []);
          const y = scale(value);
          return plots.map(plot => {
            const annotationValue = plotScale(plot) === scale ? value : plotScale(plot).invert(y);
            return [{value: annotationValue}];
          });
        }).each(function (d, i) {
          plots[i](d3_select(this));
        });
      }

      static plots(_) {
        if (!arguments.length) return plots;
        plots = _;
        return plotComposer;
      }

      /**
       * The scale of the parent
       * @param _
       * @returns {*}
       */
      static scale(_) {
        if (!arguments.length) return scale;
        scale = _;
        return plotComposer;
      }

      /**
       * How do get a value from the root datum
       * @param _ A function taking d and returning a value
       * @returns {*}
       */
      static accessor(_) {
        if (!_) return accessor;
        accessor = _;
        return plotComposer;
      }

      /**
       * A string id that distinguishes this composed plot from another.
       * @param _
       * @returns {*}
       */
      static scope(_) {
        if (!_) return dataSelector.scope();
        dataSelector.scope(_);
        return plotComposer;
      }

      /**
       * A function to obtain the scale of the child plots
       * @param _
       * @returns {*}
       */
      static plotScale(_) {
        if (!_) return plotScale;
        plotScale = _;
        return plotComposer;
      }
    }

    return plotComposer;
  }

  return {
    dataSelector: DataSelector,

    appendPathsGroupBy,

    appendPathsUpDownEqual,

    horizontalPathLine(accessor_date, x, accessor_value, y) {
      return d => {
        if (!d.length) return null;

        const firstDatum = d[0];
        const lastDatum = d[d.length - 1];

        return `M ${x(accessor_date(firstDatum))} ${y(accessor_value(firstDatum))} L ${x(accessor_date(lastDatum))} ${y(accessor_value(lastDatum))}`;
      };
    },

    pathLine: PathLine,

    pathArea: PathArea,

    barWidth,

    scaledStrokeWidth(x, max = 1, div = 1) {
      return () => `${Math.min(max, barWidth(x) / div)}px`;
    },

    /**
     * @param path A path generator constructor function that will construct a function that takes data point and returns a path
     */
    joinPath(path) {
      return data => arrayJoin(data.map(path()), ' ');
    },

    interaction: {
      mousedispatch(dispatch) {
        return selection => selection.on('mouseenter', function (d) {
          d3_select(this.parentNode).classed('mouseover', true);
          dispatch.call('mouseenter', this, d);
        })
          .on('mouseleave', function (d) {
            const parentElement = d3_select(this.parentNode);
            if (!parentElement.classed('dragging')) {
              parentElement.classed('mouseover', false);
              dispatch.call('mouseout', this, d);
            }
          })
          .on('mousemove', function (d) {
            dispatch.call('mousemove', this, d);
          });
      },

      dragStartEndDispatch(drag, dispatch) {
        return drag.on('start', function (d) {
          d3_select(this.parentNode.parentNode).classed('dragging', true);
          dispatch.call('dragstart', this, d);
        })
          .on('end', function (d) {
            d3_select(this.parentNode.parentNode).classed('dragging', false);
            dispatch.call('dragend', this, d);
          });
      }
    },

    plotComposer: PlotComposer
  };
};
