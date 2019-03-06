<template>
	<div class="chart" :style="{height: height + 'px'}">
		<RadioGroup size="small" type="button" v-model="selectedPeriod">
			<Radio v-for="item in periods" :key="item" :label="item">
				{{item}}
			</Radio>
		</RadioGroup>
		&nbsp;
		<Checkbox label="ma" v-model="indicators.ma3.show" v-on:on-change="onchange('ma3')">MA3</Checkbox>
		<Checkbox label="ma" v-model="indicators.ma10.show" v-on:on-change="onchange('ma10')">MA10</Checkbox>
		<Checkbox label="ma" v-model="indicators.ma30.show" v-on:on-change="onchange('ma30')">MA30</Checkbox>
		<Checkbox label="boll" v-model="indicators.boll.show" v-on:on-change="onchange('boll')">BOLL</Checkbox>

		<Dropdown v-on:on-click="onSelectedItem">
			<a href="javascript:void(0)">
				K线样式({{selectedItem}})
				<Icon type="ios-arrow-down"></Icon>
			</a>
			<DropdownMenu slot="list" >
				<DropdownItem name="candle" :selected="selectedItem === 'candle'" >Candles</DropdownItem>
				<DropdownItem name="ohlc" :selected="selectedItem === 'ohlc'">Bars</DropdownItem>
			</DropdownMenu>
		</Dropdown>

		<div id="CHART" ref="CHART" :style="{height: height - 30 + 'px'}"></div>
	</div>
</template>

<script>
	import ChartSet from './index'
	// 不同周期对应秒数
	const Periods = {
		'5s': 5 * 1e9,
		'1m': 60 * 1e9,
		'5m': 60 * 5 * 1e9,
		'15m': 60 * 15 * 1e9,
		'30m': 60 * 30 * 1e9,
		'1H': 60 * 60 * 1e9,
		'1D': 60 * 60 * 24 * 1e9
	}

	export default {
		name: 'Chart',
		data() {
			return {
				width: this.$root.windowWidth,
				periods: Object.keys(Periods),
				selectedPeriod: '1m',
				selectedItem: 'candle',
				indicators: {
					'ma3': {
						id: 'ma3',
						name: 'ma',
						type: 'ma',
						params: 3,
						show: true
					},
					'ma10': {
						id: 'ma10',
						name: 'ma',
						type: 'ma',
						params: 10,
						show: true
					},
					'ma30': {
						id: 'ma30',
						name: 'ma',
						type: 'ma',
						params: 30,
						show: true
					},
					'boll': {
						id: 'boll',
						name: 'boll',
						type: 'boll',
						params: {n: 3, p: 5},
						show: true
					},
				}
			}
		},
		computed: {
			duration() {
				return Periods[this.selectedPeriod]
			}
		},
		props: {
			instrumentId: {
				type: String,
				required: true,
				default: 'KQ.m@CFFEX.IF'
			},
			height: {
				type: Number,
				required: true,
				default: 400
			}
		},
		methods: {
			onchange: function (indicator_name) {
				this.chart.showPlot(this.indicators[indicator_name])
			},
			onSelectedItem: function (new_item_name) {
				this.chart.showPlot({
					id: this.selectedItem, show: false
				})
			 	this.selectedItem = new_item_name
				this.chart.showPlot({
					id: new_item_name, show: true
				})
			},
			keyUpHandler(e) {
				if (e.key === "Escape") {
					this.$router.go(-1)
				}
			},
		},
		watch: {
			instrumentId: {
				handler(newVal, oldVal) {
					this.$tqsdk.subscribe_quote([this.instrumentId])
					if (this.chart) this.chart.symbol(newVal)
				},
				immediate: true
			},
			duration: {
				handler(newVal, oldVal) {
					if (this.chart) this.chart.duration(newVal)
				},
				immediate: true
			},
			height: {
				handler(newVal, oldVal) {
					if (this.chart) {
						this.chart.height = this.$refs.CHART.clientHeight
						this.chart.draw()
					}
				},
				immediate: true
			}
		},
		activated() {
			document.addEventListener('keyup', this.keyUpHandler, true)
		},
		deactivated() {
			document.removeEventListener('keyup', this.keyUpHandler, true)
		},
		mounted() {
			this.$on('global:resize', function () {
				this.chart.height = this.$refs.CHART.clientHeight
				this.chart.width = this.$refs.CHART.clientWidth
				this.chart.draw()
			})


			this.$nextTick(function () {
				// Code that will run only after the entire view has been rendered
				let chartHeight = this.$refs.CHART.clientHeight // this.height - 30 - 2
				let chartWidth = this.$refs.CHART.clientWidth
				let margin = {top: 20, right: 50, bottom: 20, left: 50}

				this.chart = new ChartSet({
					id: 'CHART',
					width: chartWidth,
					height: chartHeight,
					margin: margin,
					tqsdk: this.$tqsdk,
					instrumentId: this.instrumentId,
					duration: this.duration,
					mainPlotType: 'candle', // 'ohlc' 'candle' 'day'
				})

				for (let k in this.indicators) {
					this.chart.addIndicator(this.indicators[k])
				}
			})
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
	#CHART {
		/*<!--border: 1px solid $table-border-color;-->*/
		border-radius: 4px;
		width: 100%;
		margin-top: 2px;
		overflow: hidden;
	}

	text.symbol {
		fill: #BBBBBB;
	}

	path {
		fill: none;
		stroke-width: 1;
	}

	text {
		fill: #000000;
	}

	g.loading {
		text {
			fill: #CCCCCC;
		}
	}

	path.candle {
		stroke: #000000;
		stroke-width: 1;

		&.body {
			&.up {
				stroke-width: 0;
				fill: #FF0000;
			}
			&.down {
				stroke-width: 0;
				fill: #00AA00;
			}
		}

		&.line {
			&.up {
				fill: none;
				stroke: #FF0000;
			}
			&.down {
				fill: none;
				stroke: #00AA00;
			}
		}
	}

	path.ohlc.body {
		fill: none;
		&.up {
			stroke: #FF0000;
		}
		&.down {
			stroke: #00AA00;
		}
		&.equal {
			stroke: #000000;
		}
	}

	//
	path.volume {
		fill: none;
		stroke-width: 0;
		&.body {
			fill: #FFFFFF;
		}
		&.up {
			fill: #FF0000;
			stroke: #FF0000;
		}
		&.down {
			stroke-width: 1;
			stroke: #00AA00;
			/*fill: #00AA00;*/
		}
	}

	path.oi {
		stroke-width: 2;
		stroke: orange;
	}

	// crosshair
	.crosshair {
		cursor: crosshair;
	}

	// ma
	path.ma3 {
		stroke: #1f77b4;
	}

	path.ma10 {
		stroke: #aec7e8;
	}

	path.ma30 {
		stroke: #ff7f0e;
	}

	// boll
	path.boll{
		&.top {
			stroke: darkred;
		}

		&.bottom {
			stroke: darkblue;
		}
	}

	.close.annotation.up path {
		fill: #00AA00;
	}

	.indicator-plot path.line {
		fill: none;
		stroke-width: 1;
	}

	path.macd {
		stroke: #0000AA;
	}

	path.signal {
		stroke: #FF9999;
	}

	path.zero {
		stroke: #BBBBBB;
		stroke-dasharray: 0;
		/*stroke-opacity: 0.5;*/
	}

	path.difference {
		fill: #BBBBBB;
		/*opacity: 0.5;*/
	}

	path.rsi {
		stroke: #000000;
	}

	path.overbought, path.oversold {
		stroke: #FF9999;
		stroke-dasharray: 5, 5;
	}

	path.middle, path.zero {
		stroke: #BBBBBB;
		stroke-dasharray: 5, 5;
	}

	.analysis path, .analysis circle {
		stroke: blue;
		stroke-width: 0.8;
	}

	.trendline circle {
		stroke-width: 0;
		display: none;
	}

	.mouseover .trendline path {
		stroke-width: 1.2;
	}

	.mouseover .trendline circle {
		stroke-width: 1;
		display: inline;
	}

	.dragging .trendline path, .dragging .trendline circle {
		stroke: darkblue;
	}

	.interaction path, .interaction circle {
		pointer-events: all;
	}

	.interaction .body {
		cursor: move;
	}

	.trendlines .interaction .start, .trendlines .interaction .end {
		cursor: nwse-resize;
	}

	.supstance path {
		stroke-dasharray: 2, 2;
	}

	.supstances .interaction path {
		pointer-events: all;
		cursor: ns-resize;
	}

	.mouseover .supstance path {
		stroke-width: 1.5;
	}

	.dragging .supstance path {
		stroke: darkblue;
	}

	.crosshair .axisannotation path {
		fill: #DDDDDD;
	}

	.tradearrow path.tradearrow {
		stroke: none;
	}

	.tradearrow path.buy {
		fill: #0000FF;
	}

	.tradearrow path.sell {
		fill: #9900FF;
	}

	.tradearrow path.highlight {
		fill: none;
		stroke-width: 2;
	}

	.tradearrow path.highlight.buy {
		stroke: #0000FF;
	}

	.tradearrow path.highlight.sell {
		stroke: #9900FF;
	}

	.y.annotation.left path {
		fill: #00AA00;
	}

	.y.annotation.right path {
		fill: #FF0000;
	}

	.x.annotation path {
		fill: #DDD80E;
	}


</style>
