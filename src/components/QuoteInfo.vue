<template>
	<div class="quoteinfo-container" v-if="quote">
		<Row>
			<Col span="12">
			<div>{{quote.ins_name}}</div>
			</Col>
			<Col span="12">
			<div>{{instrumentId}}</div>
			</Col>
		</Row>
		<div class="contrast">
			<Row>
				<Col span="6">
					<div>卖一</div>
				</Col>
				<Col span="6">
				<div>{{formatter(quote.ask_price1)}}</div>
				</Col>
				<Col span="6">
				{{quote.ask_volume1}}
				</Col>
				<Col span="6"></Col>
			</Row>
			<div class="outer">
				<div class="inner" :style="{width: innerWidth * 100 + '%'}"></div>
			</div>
			<Row>
				<Col span="6">
					买一
				</Col>
				<Col span="6">
				{{formatter(quote.bid_price1)}}</Col>
				<Col span="6">
				{{quote.bid_volume1}}</Col>
				<Col span="6"></Col>
			</Row>
		</div>
		<Row>
			<Col span="6">
				最新价
			</Col>
			<Col span="6" :class="classOfColor">
				{{formatter(quote.last_price)}}
			</Col>
			<Col span="6">
				昨结算
			</Col>
			<Col span="6">
				{{formatter(quote.pre_settlement)}}
			</Col>

			<Col span="6">
				涨跌
			</Col>
			<Col span="6" :class="classOfColor">
				{{formatter(quote.change)}}
			</Col>
			<Col span="6">
				今开
			</Col>
			<Col span="6">
				{{quote.open}}
			</Col>

			<Col span="6">
				涨跌幅
			</Col>
			<Col span="6" :class="classOfColor">
				{{ quote.change_percent | toPercent }}%
			</Col>
			<Col span="6">
				最高
			</Col>
			<Col span="6">
				{{formatter(quote.highest)}}
			</Col>

			<Col span="6">
				总手
			</Col>
			<Col span="6" :class="classOfColor">
				{{quote.volume}}
			</Col>
			<Col span="6">
				最低
			</Col>
			<Col span="6">
				{{formatter(quote.lowest)}}
			</Col>

			<Col span="6">
				涨停
			</Col>
			<Col span="6" class="R">
				{{formatter(quote.upper_limit)}}
			</Col>
			<Col span="6">
				收盘
			</Col>
			<Col span="6">
				{{formatter(quote.close)}}
			</Col>

			<Col span="6">
				跌停
			</Col>
			<Col span="6" class="G">
				{{formatter(quote.lower_limit)}}
			</Col>
			<Col span="6">
				结算
			</Col>
			<Col span="6">
				{{formatter(quote.settlement)}}
			</Col>
		</Row>
		<Row>
			<Col span="6">
			持仓量
			</Col>
			<Col span="6">
			{{quote.open_interest}}</Col>
			<Col span="6">
			日增</Col>
			<Col span="6">
			{{quote.open_interest - quote.pre_open_interest }}</Col>
		</Row>
	</div>
</template>
<script>
	import {FormatPrice} from '@/plugins/utils'

	export default {
		data() {
			return {
				quote: this.$tqsdk.get_quote(this.instrumentId)
			}
		},
		mounted: function () {
			this.$on('tqsdk:rtn_data', this.update)
		},
		watch: {
			instrumentId: {
				handler(newVal, oldVal) {
					this.quote = this.$tqsdk.get_quote(newVal)
				},
				immediate: true
			}
		},
		props: {
			instrumentId: String
		},
		computed: {
			classOfColor: function () {
				if (this.quote['change'] > 0) return 'R'
				else if (this.quote['change'] < 0) return 'G'
				else return ''
			},
			innerWidth: function () {
				return this.quote.bid_volume1 / (this.quote.bid_volume1 + this.quote.ask_volume1)
			}
		},
		methods: {
			formatter: function (price) {
				return FormatPrice(price, this.quote.price_decs)
			},
			update: function () {
				this.quote = this.$tqsdk.get_quote(this.instrumentId)
				this.$forceUpdate()
			}
		}
	};
</script>
<style scoped lang="scss">
	.quoteinfo-container {
		margin: 0px 6px 0px 6px;

		> .ivu-row:first-child {
			font-size: 16px;
			font-weight: 600;
		}

		.contrast {
			.ivu-row {
				font-size: 16px;
				font-weight: 500;
				.ivu-col {
					padding: 0px;
				}
				&:first-child {
					padding-top: 4px;
				}
				&:last-child {
					padding-bottom: 4px;
				}
			}
			.outer {
				height: 6px;
				width: 100%;
				background-color: $area-color-G;
				.inner {
					height: 6px;
					background-color: $area-color-R;
				}
			}
		}

		.ivu-row {
			.ivu-col {
				&:nth-child(odd) {
					color: $text-color-2nd;
					text-align: left;
					padding-left: 8px;
				}
				&:nth-child(even) {
					text-align: right;
					padding-right: 8px;
				}
				&.R {
					color: red;
				}
				&.G {
					color: green;
				}
			}
		}
	}
</style>
