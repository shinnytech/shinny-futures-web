<template>
	<div>
		<!--<div>-->
		<!--<button type="button" v-on:click="back_function()">Back</button>-->
		<!--</div>-->
		<div id="tv_chart_container">
		</div>

	</div>

</template>

<script>
	import Tv from "./script";

	import Stock from "./script/index.js";

	export default {
		props: ["symbol"],
		mounted() {
			//this.onKeyChange(13);

			// Tv.init({ symbol: "SHFE.cu1809", interval: "1D" });
			//
			// const TQ = new TQSDK(undefined, 'ws://127.0.0.1:7777/');
			// // const TQ = new TQSDK(undefined, "ws://39.108.122.251:7777/");
			// Tv.subscribe_tq(TQ);
			//// console.log(Tv.TQ);

			// console.log("index.vue mounted before TQ");

			if (typeof this.$tv_obj == "undefined") {
				// console.log("Tradingview Init");
				//Tv.init({ symbol: "SHFE.cu1809", interval: "1D" });
				Tv.init({ symbol: this.symbol || "SHFE.cu1809", interval: "1D" });
				Tv.subscribe_tq(TQ);
				this.$tv_obj = Tv;
				Stock.setRoute(this.$router);
				Stock.setStore(this.$store);

			} else {
				Stock.setRoute(this.$router);
				Stock.setStore(this.$store);
				// console.log(this.$tv_obj.TQ);
				Stock.setSymbol(this.$route.query.symbol);
			}

			//
			//
			// // 开启交易面板
			// const eventList = [
			//   { name: "init", price: undefined },
			//   { name: "setBuy", price: 478 },
			//   { name: "setSell", price: 358 },
			//   { name: "setSpread", price: 120 }
			// ];
			// setTimeout(() => {
			//   eventList.forEach(elm => {
			//     frames[0].window.postMessage(
			//       { eventType: elm.name, value: elm.price },
			//       "*"
			//     );
			//   });
			// }, 300);
		},
		methods: {
			init_tq(tq_obj) {
				const TQ = tq_obj;
				Tv.subscribe_tq(TQ);
			},

			back_function() {
				this.$router.back(-1);
			}
		}
	};
</script>

<style scoped>
	#tv_chart_container {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>

