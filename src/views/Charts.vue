<template>
	<div class="charts-container">
		<Chart :instrumentId="instrumentId" :height="height"/>
	</div>
</template>

<script>
	import Chart from '@/components/Chart/index.vue'

	export default {
		components: {
			Chart
		},
		computed: {
			instrumentId: function () {
				return this.$route.params.instrument_id
			},
			height: function () {
				return this.$root.windowHeight * this.$root.appSplit
			}
		},
		created: function () {
		},
		mounted: function () {
		},
		methods: {
			goBack() {
				this.$router.go(-1)
			},
			onKeyUp(e) {
				console.log('onKeyUp', e)
			},
//      onKeyChange (keyCode) {
//        var that = this
//        if (document.addEventListener) {
//          document.addEventListener('keypress', keyPressHandler, true)
//        } else {
//          document.attachEvent('onkeypress', keyPressHandler)
//        }
//
//        function keyPressHandler (evt) {
//          console.log(evt, evt.keyCode)
//          if (evt.keyCode === keyCode) {
//            // 为按下回车时调用的方法
//            that.goBack()
//          }
//        }
//      }
		}
	}
</script>

<style scoped>
	.charts-container {
		width: 100%;
		height: 100%;
		padding: 2px;
	}

	#tv_chart_container {
		position: relative;
		width: 100%;
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
</style>
