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
		}
	}
</script>

<style scoped>
	.charts-container {
		width: 100%;
		height: 100%;
		padding: 2px;
	}
</style>
