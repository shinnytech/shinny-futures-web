<template>
	<div>
		<el-container>
			<el-aside style="border-right: 1px solid rgb(238, 238, 238)">
				<el-form ref="form" id="trade" :model="form">
					<el-form-item label="">
						<el-input v-model="instrumentId" clearable></el-input>
					</el-form-item>
					<el-form-item label="手数">
						<el-input-number v-model="form.volume" />
					</el-form-item>
					<el-form-item label="价格">
						<el-input-number :step="priceStep" v-model="theLastPrice" />
					</el-form-item>
					<el-row>
						<el-col :span="12">
							<el-button plain @click="setOrder('BUY','OPEN')">买开</el-button>
						</el-col>
						<el-col :span="12">
							<el-button plain @click="setOrder('SELL','OPEN')">卖开</el-button>
						</el-col>
						<el-col :span="12">
							<el-button plain @click="setOrder('BUY','CLOSE')">买平</el-button>
						</el-col>
						<el-col :span="12">
							<el-button plain @click="setOrder('SELL','CLOSE')">卖平</el-button>
						</el-col>
					</el-row>
				</el-form>
			</el-aside>
			<el-main>
				<el-tabs type="border-card">
					<el-tab-pane label="账户" name="first">
						<mTable id="table-four" height="150" :tableData="account" :tableHeader="accountHeader" @cellClick="cellClick" />
					</el-tab-pane>
					<el-tab-pane label="持仓" name="third">
						<mTable id="table-two" height="150" :tableData="positions" :tableHeader="positionHeader" @cellClick="cellClick" />
					</el-tab-pane>
					<el-tab-pane label="委托单" name="second">
						<mTable id="table-one" :tableData="orders" :tableHeader="orderHeader" @cellClick="cellClick" @cellDblclick="cellDblclick"
								height="150" />
					</el-tab-pane>
					<el-tab-pane label="成交记录" name="fourth">
						<mTable id="table-three" height="150" :tableData="trades" :tableHeader="tradeHeader" @cellClick="cellClick" />
					</el-tab-pane>
				</el-tabs>
			</el-main>
		</el-container>
	</div>
</template>
<script>
	import mTable from "../components/table";
	import {
		accountHeader,
		orderHeader,
		positionHeader,
		tradeHeader
	} from "../assets/tableHeader.js";
	import {
		directionMap,
		offsetMap,
		statusMap
	} from "../assets/formatter.js";

	export default {
		components: {
			mTable
		},
		props: {
			priceStep: {
				default: 1
			},
			lastPrice: {
				type: Number
			},
			instrumentId: {
				type: String
			}
		},
		data() {
			return {
				quote: [],
				form: {
					volume: 1
				},
				accountHeader,
				orderHeader,
				positionHeader,
				tradeHeader,
				orders: [],
				positions: [],
				trades: [],
				account: [],
				init_status: false,
				theLastPrice: this.lastPrice
			};
		},
		mounted() {
			if (!this.init_status) {
				this.register_trade_ui(1000);
				setTimeout(() => this.peek_message(), 500);
			}

			this.getOrderDict();
			this.getPositionDict();
			this.getTradeDict();
			this.getAccount();
		},
		computed: {},
		methods: {
			register_trade_ui(update_interval) {
				const that = this;
				tr_TQ.register_trade_ui(that, update_interval);
			},
			accountFormatter(row) {
				return row.risk_ratio;
			},

			peek_message() {
				tr_TQ.ws.peek_message();
				setTimeout(() => this.peek_message(), 1000);
			},

			directionFormatter(row, column) {
				return directionMap[row];
			},

			cellClick(row) {
				console.log(row);
			},
			cellDblclick(row) {
				tr_TQ.ws.send_json({
					aid: "cancel_order", // 撤单请求
					order_id: row.order_id,
					user_id: window.account_id
				});
				console.log("cancel order : ");
				console.log(row);
			},
			RandomStr(len = 8) {
				var charts = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(
					""
				);
				var s = "";
				for (var i = 0; i < len; i++) s += charts[(Math.random() * 0x3e) | 0];
				return s;
			},

			ParseSymbol(str) {
				var match_arr = str.match(/([^\.]+)\.(.*)/);
				return {
					exchange_id: match_arr ? match_arr[1] : "", // 交易所代码
					instrument_id: match_arr ? match_arr[2] : "" // 合约代码
				};
			},
			setOrder(direction, offset) {
				console.log(this.instrumentId);

				// let order = tr_TQ.INSERT_ORDER({
				//   symbol: this.instrumentId,
				//   direction: direction,
				//   offset: offset,
				//   volume: this.form.volume,
				//   limit_price: this.lastPrice,
				// });

				let {
					exchange_id,
					instrument_id
				} = ParseSymbol(this.instrumentId);

				tr_TQ.ws.send_json({
					aid: "insert_order", //必填, 下单请求
					user_id: window.account_id, //必填, 需要与登录用户名一致, 或为登录用户的子账户(例如登录用户为user1, 则报单 user_id 应当为 user1 或 user1.some_unit)
					order_id: "EXT" + "." + this.RandomStr(8), //必填, 委托单号, 需确保在一个账号中不重复, 限长512字节
					exchange_id: exchange_id, //必填, 下单到哪个交易所
					instrument_id: instrument_id, //必填, 下单合约代码
					direction: direction, //必填, 下单买卖方向
					offset: offset, //必填, 下单开平方向, 仅当指令相关对象不支持开平机制(例如股票)时可不填写此字段
					volume: this.form.volume, //必填, 下单手数
					price_type: "LIMIT", //必填, 报单价格类型
					limit_price: this.lastPrice, //当 price_type == LIMIT 时需要填写此字段, 报单价格
					volume_condition: "ANY",
					time_condition: "GFD"
				});

				// this.$notify({
				// 	title: "成功",
				// 	message: "下单成功",
				// 	type: "success"
				// });
			},
			getAccount() {
				let account = tr_TQ.GET_ACCOUNT();
				// this.account = [
				//   {
				//     //核心字段
				//     account_id: "423423", //账号
				//     currency: "CNY", //币种
				//     balance: 9963216.550000003, //账户权益
				//     available: 9480176.150000002, //可用资金
				//     //参考字段
				//     pre_balance: 12345, //上一交易日结算时的账户权益
				//     deposit: 42344, //本交易日内的入金金额
				//     withdraw: 42344, //本交易日内的出金金额
				//     commission: 123, //本交易日内交纳的手续费
				//     preminum: 123, //本交易日内交纳的权利金
				//     static_balance: 124895, //静态权益
				//     position_profit: 12345, //持仓盈亏
				//     float_profit: 8910.231, //浮动盈亏
				//     risk_ratio: 0.048482375, //风险度
				//     margin: 11232.23, //占用资金
				//     frozen_margin: 12345, //冻结保证金
				//     frozen_commission: 123, //冻结手续费
				//     frozen_premium: 123, //冻结权利金
				//     close_profit: 12345, //本交易日内平仓盈亏
				//     position_profit: 12345, //当前持仓盈亏
				//     position_profit: 12345 //当前持仓盈亏
				//   }
				// ];
			},
			getOrderDict() {
				var orders = tr_TQ.GET_ORDER_DICT();
				// this.orders = [
				//   {
				//     order_type: "TRADE", //指令类型
				//     session_id: "abc", //会话ID
				//     order_id: "MAIN.djkIjXj", //委托单ID, 在每个会话中唯一
				//     exchange_id: "SHFE", //交易所
				//     instrument_id: "cu1801", //合约代码
				//     direction: "BUY", //下单方向
				//     offset: "OPEN", //开平标志
				//     volume_orign: 6, //总报单手数
				//     volume_left: 3, //未成交手数
				//     trade_type: "TAKEPROFIT", //指令类型
				//     price_type: "LIMIT", //价格类型
				//     limit_price: 45000, //委托价格, 仅当 price_type = LIMIT 时有效
				//     time_condition: "GTD", //时间条件
				//     volume_condition: "ANY", //数量条件
				//     min_volume: 0,
				//     hedge_flag: "SPECULATION", //保值标志
				//     status: "ALIVE", //委托单状态, ALIVE=有效, FINISHED=已完
				//     last_msg: "", //最后操作信息
				//     force_close: "NOT", //强平原因
				//     frozen_money: 15750, //冻结金额
				//     insert_date_time: "151754", //下单时间
				//     exchange_order_id: "434214" //交易所单号
				//   }
				// ];
			},
			getPositionDict() {
				var positions = tr_TQ.GET_POSITION();
				// this.positions = [
				//   {
				//     //核心字段
				//     exchange_id: "SHFE", //交易所
				//     instrument_id: "cu1801", //合约代码
				//     volume_long: 5, //多头持仓手数
				//     volume_short: 5, //空头持仓手数
				//     hedge_flag: "SPEC", //套保标记
				//     //参考字段
				//     open_price_long: 3203.5, //多头开仓均价
				//     open_price_short: 3100.5, //空头开仓均价
				//     open_cost_long: 3203.5, //多头开仓市值
				//     open_cost_short: 3100.5, //空头开仓市值
				//     margin: 32324.4, //占用保证金
				//     float_profit_long: 32324.4, //多头浮动盈亏
				//     float_profit_short: 32324.4, //空头浮动盈亏
				//     volume_long_today: 5, //多头今仓手数
				//     volume_long_his: 5, //多头老仓手数
				//     volume_long_frozen: 5, //多头持仓冻结
				//     volume_long_frozen_today: 5, //多头今仓冻结
				//     volume_short_today: 5, //空头今仓手数
				//     volume_short_his: 5, //空头老仓手数
				//     volume_short_frozen: 5, //空头持仓冻结
				//     volume_short_frozen_today: 5 //空头今仓冻结
				//   }
				// ];
			},
			getTradeDict() {
				var trades = tr_TQ.GET_TRADE_DICT();
				// this.trades = [
				//   {
				//     order_id: "123",
				//     exchange_id: "SHFE", //交易所
				//     instrument_id: "cu1801", //交易所内的合约代码
				//     exchange_trade_id: "1243", //交易所成交号
				//     direction: "BUY", //成交方向
				//     offset: "OPEN", //开平标志
				//     volume: 6, //成交手数
				//     price: 1234.5, //成交价格
				//     trade_date_time: 1928374000000000 //成交时间
				//   }
				// ];
			}
		}
	};

</script>
<style scoped>
	.el-container {
		margin-bottom: -14px !important;
	}

	.el-main {
		padding: 4px !important;
	}

	#table-one {
		height: calc(100% - 14px);
	}

	#trade {
		background-color: white;
		box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
			0 1px 5px 0 rgba(0, 0, 0, 0.12);
		margin-bottom: 14px;
		padding: 8px 12px;
	}

	.el-form-item {
		margin-bottom: 12px;
	}

	#trade>div.el-row>div:nth-child(1),
	#trade>div.el-row>div:nth-child(2) {
		margin-bottom: 12px;
		margin-top: 12px;
	}

</style>
