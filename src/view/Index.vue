<template>
	<div>
		<NAV />
		<el-container style="min-height:100%; border: 1px solid #eee">
			<el-main>
				<section id="first-wrap">
					<div class="first-wrap__child" v-if="!showStcok">
						<div class="tag-wrap">
							<el-button v-for="(item,index) in tag" :key="index" @click="setCurQuote(item.label)" :style="{background:curLable==item.label?'':''}">{{item.label}}</el-button>
						</div>
						<mTable id="first" :tableData="quote" :tableHeader="quoteHeader" :height="topHeight" @cellClick="cellClick"
						    @cellDblclick="cellDblclick" :loading="loading" :cell_style="cell_style" />
					</div>
					<stock :symbol="symbol" v-if="showStcok" :style="{height:topHeight+'px'}" />
					<div class="return" @click="goBack" v-if="showStcok">
						<img src="../assets/return.svg">
					</div>
					<img src="../assets/move.svg" @mousedown="onMove" class="move">
				</section>
				<mTrade v-if="ifLogin" :priceStep="priceStep" :lastPrice="lastPrice" :instrumentId="instrumentId" />
			</el-main>
		</el-container>
	</div>
</template>

<script>
	import NAV from "../components/nav";
	import mTable from "../components/table";
	import mTrade from "./trade";
	import axios from "axios";
	import {
		quoteHeader
	} from "../assets/tableHeader.js";
	import {
		tag,
		categories_map
	} from "../assets/quoteType.js";
	import {
		indexColumnColorMap
	} from "../assets/formatter.js";
	import stock from "../components/TradeView/index";

	export default {
		components: {
			mTable,
			NAV,
			mTrade,
			stock
		},
		data() {
			return {
				form: {},
				loading: false,
				tag,
				quote: [],
				quoteHeader,
				priceStep: 1,
				instrumentId: null,
				lastPrice: null,
				category_symbol_map: {},
				all_category_list: [],
				ch_category_symbol_map: {},
				quotes_data_map: {},
				curLable: "全部主力",
				init_status: false,
				symbol_info: undefined,
				showStcok: false,
				topHeight: this.$store.state.session_id ?
					(window.innerHeight - 96) / 7 * 4 : window.innerHeight - 180
			};
		},
		computed: {
			ifLogin() {
				return this.$store.state.session_id ? true : false;
			}
		},
		mounted() {
			//this.onKeyChange(13);//enter
			//this.onKeyChange(27);//esc
			this.onKeyChange(96); //~

			if (this.$store.state.index_label === null) {
				//console.log("setIndexLable Init");
				this.$store.commit("setIndexLable", this.curLable);
			} else {
				//console.log("getIndexLable : " + this.$store.state.index_label);
				this.curLable = this.$store.state.index_label;
			}

			if (!this.init_status) {
				this.register_index_ui(1000);
				this.init_category_symbol_map();
			} else {
				this.setCurQuote(this.curLable);
				TQ.update_quote(new Date().getTime(), true);
			}
			//this.getQuote("SHFE.cu1809");
		},
		methods: {
			onMove(e) {
				let odiv = e.target;
				let disX = e.clientX - odiv.offsetLeft;
				let disY = e.clientY - odiv.offsetTop;
				document.onmousemove = e => {
					let top = e.clientY - disY;

					console.log("this.topHeight", this.topHeight);

					this.topHeight = top - 180;
				};
				document.onmouseup = e => {
					document.onmousemove = null;
					document.onmouseup = null;
				};
			},
			goBack() {
				this.showStcok = false;
				console.log(11111111111111);
				this.$store.commit("setshowStcok_status", this.showStcok);
			},
			onKeyChange(keyCode) {
				var that = this;
				if (document.addEventListener) {
					document.addEventListener("keypress", keyPressHandler, true);
				} else {
					document.attachEvent("onkeypress", keyPressHandler);
				}

				function keyPressHandler(evt) {
					//console.log("press key : " + evt.keyCode);
					if (evt.keyCode == keyCode) {
						//为按下回车时调用的方法
						//alert(evt + "2211");
						that.goBack();
					}
				}
			},
			change_to_color(change_num) {
				if (change_num > 0) return "red";
				else if (change_num < 0) return "green";
				else return "black";
			},
			dict_sort(dic, sort_key_dic) {
				return Object.keys(dic).sort(function (a, b) {
					return sort_key_dic[a] - sort_key_dic[b];
				});
			},
			list_sort(list, sort_key_dic) {
				return list.sort(function (a, b) {
					return sort_key_dic[a] == sort_key_dic[b] ?
						a > b :
						sort_key_dic[a] - sort_key_dic[b];
				});
			},
			fetch_symbol_info() {
				axios({
						headers: {
							Accept: "application/json; charset=utf-8"
						},
						method: "GET",
						url: info_server_url
					})
					.then(res => {
						this.symbol_info = res.data;
					})
					.catch(res => {
						that.$notify({
							title: "警告",
							message: "这是一条警告的提示消息",
							type: "warning"
						});
					});
			},
			init_category_symbol_map() {
				console.log("start init_category_symbol_map");

				// var tq_quotes = TQ.dm.datas.quotes;
				// console.log( TQ );
				// if (typeof tq_quotes == "undefined") {
				//     setTimeout(() => this.init_category_symbol_map(), 1000);
				//     console.log("retry init_category_symbol_map because of TQ.dm.datas.quotes is undefined");
				//     return false;
				// }
				// if( Object.keys(tq_quotes).length < 300 ){
				//     setTimeout(() => this.init_category_symbol_map(), 1000);
				//     console.log("retry init_category_symbol_map because of TQ.dm.datas.quotes not load complete");
				//     return false;
				// }
				// console.log(tq_quotes);

				this.fetch_symbol_info();
				var tq_quotes = this.symbol_info;

				if (tq_quotes === undefined) {
					setTimeout(() => this.init_category_symbol_map(), 1000);
					console.log(
						"retry init_category_symbol_map because of symbol_info is undefined"
					);
					return false;
				}
				console.log(tq_quotes);

				try {
					var symbol_sortkey_map = {};
					for (var k in tq_quotes) {
						if (
							k.indexOf("&") > -1 ||
							k.indexOf("@") > -1 ||
							k.indexOf("-") > -1 ||
							k.indexOf("_") > -1
						)
							continue;
						if (k.search(/[a-zA-Z]+\.[a-zA-Z]+[0-9]+[CP][0-9]+/g) > -1)
							//期权排除
							continue;

						var expired_judge = tq_quotes[k]["expired"];
						var category = k.match(/[^0-9]/gi).join("");

						//console.log(k)
						//console.log(expired_judge)

						if (!expired_judge) {
							if (this.has_key(this.category_symbol_map, category)) {
								this.category_symbol_map[category].push(k);
								symbol_sortkey_map[k] = tq_quotes[k]["sort_key"];
							} else {
								this.category_symbol_map[category] = [k];
								symbol_sortkey_map[k] = tq_quotes[k]["sort_key"];
								this.all_category_list.push(category);
							}
							this.category_symbol_map[category] = this.list_sort(
								this.category_symbol_map[category],
								symbol_sortkey_map
							);
							tq_quotes[k]["color"] = this.change_to_color(
								tq_quotes[k]["change"]
							);
							this.quotes_data_map[k] = tq_quotes[k];
						}
					}
					console.log(this.category_symbol_map);
					for (var ch_name in categories_map) {
						if (ch_name == "全部主力") {
							var quanBuZhuLi_list = [];
							for (var i in this.all_category_list) {
								var code_temp = "KQ.m@" + this.all_category_list[i];
								quanBuZhuLi_list.push(code_temp);
								//console.log(code_temp)
								//console.log( tq_quotes[code_temp] )
								tq_quotes[code_temp]["color"] = this.change_to_color(
									tq_quotes[code_temp]["change"]
								);
								this.quotes_data_map[k] = tq_quotes[code_temp];

								symbol_sortkey_map[code_temp] = tq_quotes[code_temp]["sort_key"];
							}
							this.ch_category_symbol_map[ch_name] = this.list_sort(
								quanBuZhuLi_list,
								symbol_sortkey_map
							);
						} else if (ch_name == "指数") {
							var zhiShui_list = [];
							for (var i in this.all_category_list) {
								var code_temp = "KQ.i@" + this.all_category_list[i];
								zhiShui_list.push(code_temp);

								tq_quotes[code_temp]["color"] = this.change_to_color(
									tq_quotes[code_temp]["change"]
								);
								this.quotes_data_map[k] = tq_quotes[code_temp];

								symbol_sortkey_map[code_temp] = tq_quotes[code_temp]["sort_key"];
							}
							this.ch_category_symbol_map[ch_name] = this.list_sort(
								zhiShui_list,
								symbol_sortkey_map
							);
						} else {
							var _list = [];

							for (var i in categories_map[ch_name]) {
								var symbol = categories_map[ch_name][i];
								_list = _list.concat(["KQ.m@" + symbol, "KQ.i@" + symbol]);
								_list = _list.concat(this.category_symbol_map[symbol]);
							}
							this.ch_category_symbol_map[ch_name] = this.list_sort(
								_list,
								symbol_sortkey_map
							);
						}
					}
				} catch (e) {
					this.category_symbol_map = {};
					this.all_category_list = [];
					this.ch_category_symbol_map = {};
					this.quotes_data_map = {};
					setTimeout(() => this.init_category_symbol_map(), 3000);
					console.log("retry init_category_symbol_map because of catching error");
					console.log(e);
					return false;
				}

				console.log(this.quotes_data_map);
				console.log(symbol_sortkey_map);
				console.log(this.ch_category_symbol_map);
				console.log("finish init_category_symbol_map");

				this.setCurQuote(this.curLable);
				setTimeout(() => this.peek_message(), 1000);
				setTimeout(() => this.tq_update_quote(), 1000);
				this.init_status = true;
			},

			peek_message() {
				TQ.ws.peek_message();
				//TQ.ws.send_json( {"aid":"peek_message"} )
				setTimeout(() => this.peek_message(), 1000);
			},

			tq_update_quote(){
				TQ.update_quote(new Date().getTime(), true)
				setTimeout(() => this.tq_update_quote(), 1000);
			},

			has_key(dict_map, key) {
				return !!dict_map[key];
			},

			register_index_ui(update_interval) {
				const that = this;
				TQ.register_index_ui(that, update_interval);
			},

			subscribe_quote(code_list) {
				var send_data = {
					aid: "subscribe_quote",
					ins_list: code_list.join()
				};

				TQ.ws.send_json(send_data);
			},

			get_code_list(tag_label) {
				// var prefix_list = categories_map[tag_label];
				// var return_list = new Array();
				// for (var i in prefix_list) {
				//   return_list.push(prefix_list[i] + "1809");
				// }
				// return return_list;

				return this.ch_category_symbol_map[tag_label];
			},
			cell_style(param) {
				if (param.column.label in indexColumnColorMap) {
					if (!(param.row === undefined)) {
						return "color:" + param.row.color;
					}
				}
				//return 'background-color:red';
			},

			cellClick(row) {
				this.priceStep = row.price_tick;
				this.lastPrice = row.last_price;
				this.instrumentId = row.instrument_id;

				////console.log(this.instrumentId);
			},
			cellDblclick(row) {
				////console.log(row.instrument_id);
				this.symbol = row.instrument_id;
				this.showStcok = true;
				this.$store.commit("setshowStcok_status", this.showStcok);

				//   let symbol = row.instrument_id;
				//   this.$router.push({ path: "/stock?symbol=" + symbol });
			},
			setCurQuote(tag_label) {
				//console.log(tag_label);
				var code_list = this.get_code_list(tag_label);
				console.error(code_list);
				this.subscribe_quote(code_list);
				TQ.set_index_code_list(code_list);
				this.$store.commit("setIndexLable", tag_label);
				TQ.update_quote(new Date().getTime(), true);
			},
			getQuote(target) {
				const that = this;

				function* TaskKLine() {
					let quote = TQ.GET_QUOTE(target);
					while (true) {
						let result = yield {
							USER_CLICK_STOP: TQ.ON_CLICK("STOP"),
							UPDATE: function () {
								if (JSON.stringify(quote) != "{}") {
									return true;
								}
								return false;
							}
						};
						if (result.UPDATE) {
							that.loading = false;
							that.quote.push(quote);
							break;
						}
						if (result.USER_CLICK_STOP) {
							that.loading = false;
							break;
						}
					}
					return;
				}
				TQ.START_TASK(TaskKLine);
			}
		}
	};

</script>

<style scoped>
	.el-main {
		background-color: #e9eef3;
	}

	/* #first-wrap {
    background-color: white;
  } */

	#first {
		box-shadow: none !important;
	}

	.first-wrap__child {
		background-color: white;
	}

	#first table>thead>tr>th:nth-child(3) {
		width: 200px;
	}

	.el-main:nth-child(1) {
		padding: 4px;
	}

	.tag-wrap {
		display: flex;
		justify-content: flex-start;
		background-color: white;
		padding: 8px;
		width: 100%;
		overflow-x: scroll;
	}

	#first-wrap {
		padding: 4px;
		margin-bottom: -8px;
		position: relative;
	}

	.first-wrap__child {
		box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
			0 1px 5px 0 rgba(0, 0, 0, 0.12);
		position: relative;
		overflow-x: hidden;
	}

	.tag-wrap .el-tag {
		margin-right: 8px;
	}

	.tag-wrap .el-tag:hover {
		cursor: pointer;
	}

	.move {
		width: 28px;
	}

	.move:hover {
		cursor: pointer;
	}

	.return {
		position: absolute;
		top: -8px;
		right: 0px;
		width: 50px;
		height: 50px;
		background-color: #409efe;
		border-radius: 80px;
		line-height: 50px;
		text-align: center;
		font-size: 14px;
		box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.5);
		color: white;
		cursor: pointer;
	}

	.return img {
		width: 24px;
		height: 24px;
		margin-top: 13px;
	}

	.el-main::-webkit-scrollbar {
		display: none;
	}

</style>
