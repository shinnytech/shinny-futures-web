/**
 * TODO Refactor this to techan.plot.annotation.axis()?
 */

/* eslint-disable */
/* no-case-declarations */
// export default (d3_svg_axis, d3_scale_linear, accessor_value, plot, plotMixin)

const p = {};

let axis = d3_svg_axis(d3_scale_linear());
let format;
const point = 4;
let height = 14;
let width = 50;
let translate = [0, 0];
let orient = 'bottom';

class Annotation {
	constructor(opts) {
		this.scale = opts.scale
		this.axis = opts.axis
		this.parentG = opts.parentG
		this.name = opts.name

		this.orient = opts.orient ? opts.orient : 'bottom'
		this.neg = (this.orient === 'left' || this.orient === 'top') ? -1 : 1;

		this.g = this.parentG.append('g')
			.attr('class', this.name)

		this.g.append('path');
		this.g.append('text');
	}

	refresh(){
		const fmt = this.axis.tickFormat() ? this.axis.tickFormat() : this.scale().tickFormat();

		this.update(p.accessor, axis, orient, fmt, height, width, point, translate);
	}

	update(accessor, axis, orient, format, height, width, point, translate) {
		const neg = orient === 'left' || orient === 'top' ? -1 : 1;

		this.g.attr('transform', `translate(${translate[0]},${translate[1]})`);
		this.g.select('path').attr('d', backgroundPath(accessor, axis, orient, height, width, point, neg));
		this.g.select('text').text(textValue(accessor, format)).call(textAttributes, accessor, axis, orient, neg);
	}

}

function textAttributes(text, accessor, axis, orient, neg) {
	const scale = axis.scale();

	switch (orient) {
		case 'left':
		case 'right':
			text.attr('x', neg * (Math.max(axis.tickSizeInner(), 0) + axis.tickPadding()))
				.attr('y', textPosition(accessor, scale))
				.attr('dy', '.32em')
				.style('text-anchor', neg < 0 ? 'end' : 'start');
			break;
		case 'top':
		case 'bottom':
			text.attr('x', textPosition(accessor, scale))
				.attr('y', neg * (Math.max(axis.tickSizeInner(), 0) + axis.tickPadding()))
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

		switch (orient) {
			case 'left':
			case 'right':
				let h = 0;

				if (height / 2 < point) pt = height / 2;
				else h = height / 2 - point;

				return `M 0 ${value} l ${neg * Math.max(axis.tickSizeInner(), 1)} ${-pt} l 0 ${-h} l ${neg * width} 0 l 0 ${height} l ${neg * -width} 0 l 0 ${-h}`;
			case 'top':
			case 'bottom':
				let w = 0;

				if (width / 2 < point) pt = width / 2;
				else w = width / 2 - point;

				return `M ${value} 0 l ${-pt} ${neg * Math.max(axis.tickSizeInner(), 1)} l ${-w} 0 l 0 ${neg * height} l ${width} 0 l 0 ${neg * -height} l ${-w} 0`;
			default:
				throw `Unsupported orient value: axisannotation.orient(${orient}). Set to one of: 'top', 'bottom', 'left', 'right'`;
		}
	};
}

export default annotation
