<template>
    <div class="chart" :style="{height: height + 'px'}">
        <RadioGroup size="small" type="button" v-model="selectedPeriod" @on-change="handlerChangePeriod">
            <Radio v-for="item in periods" :key="item" :label="item">
                {{item}}
            </Radio>
        </RadioGroup>
        <div id="CHART" ref="CHART" :style="{height: height - 30 + 'px'}">

        </div>
    </div>
</template>

<script>
  import * as d3 from 'd3'
  import {DM, QuoteWs} from '@/store/websockets/index'
  import Chart from './index'

  window.d3 = d3

  const Periods = {
    '5s': 5,
    '10s': 10,
    '30s': 30,
    '1m': 60,
    '5m': 60 * 5,
    '15m': 60 * 15,
    '30m': 60 * 30,
    '1H': 60 * 60,
    '1D': 60 * 60 * 24,
  }

  export default {
    name: 'Chart',
    components: {},
    data() {
      return {
        periods: Object.keys(Periods),
        selectedPeriod: '1m'
      }
    },
    computed: {
      duration() {
        return Periods[this.selectedPeriod] * 1e9
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
    watch: {
      instrumentId: {
        handler(newVal, oldVal) {
          this.$store.commit('SUBSCRIBE_QUOTE', [this.instrumentId])
          if (this.chart) {
            this.chart.setSymbol(newVal)
          }
        },
        immediate: true
      },
      duration: {
        handler(newVal, oldVal) {
          if (this.chart) {
            this.chart.setDuration(newVal)
          }
        },
        immediate: true
      },
      height: {
        handler(newVal, oldVal) {
          console.log(newVal, oldVal)
          if (this.chart) {
            this.chart.setHeight(newVal - 30 - 2)
          }
        },
        immediate: true
      }
    },
    methods: {
      handlerChangePeriod: function (period) {
        this.updatePeriod(period)
      },
      updatePeriod: function (period) {
      }
    },
    mounted() {
      this.$nextTick(function () {
        // Code that will run only after the entire view has been rendered
        let chartHeight = this.height - 30 - 2
        let chartWidth = this.$refs.CHART.clientWidth
        let margin = {top: 10, right: 50, bottom: 30, left: 50}

        this.chart = new Chart({
          id: 'CHART',
          width: chartWidth,
          height: chartHeight,
          margin: margin,

          dm: DM,
          ws: QuoteWs,
          instrumentId: this.instrumentId,
          duration: this.duration
        })
      })
    },
    destroyed(){
      console.log('destroyed')
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
    #CHART {
        border: 1px solid $table-border-color;
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
    }
    path.candle.body {
        stroke-width: 0;
    }

    path.candle.up {
        fill: #FF0000;
        stroke: #FF0000;
    }

    path.candle.down {
        stroke-width: 1;
        fill: #FFFFFF;
        stroke: #00AA00;
    }
    path.candle.equal {
        stroke-width: 1;
        stroke: #000000;
    }

    //
    path.volume {
        fill: #DDDDDD;
    }
    path.volume.body {
        stroke-width: 0;
    }

    path.volume.up {
        fill: #FF0000;
        stroke: #FF0000;
    }

    path.volume.down {
        stroke-width: 1;
        fill: #FFFFFF;
        stroke: #00AA00;
    }
    path.volume.equal {
        stroke: #000000;
    }

    path.oi {
        stroke-width: 2;
        stroke: orange;
    }


    .close.annotation.up path {
        fill: #00AA00;
    }


    .indicator-plot path.line {
        fill: none;
        stroke-width: 1;
    }

    .ma-0 path.line {
        stroke: #1f77b4;
    }

    .ma-1 path.line {
        stroke: #aec7e8;
    }

    .ma-2 path.line {
        stroke: #ff7f0e;
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
        stroke-opacity: 0.5;
    }

    path.difference {
    fill: #BBBBBB;
    opacity: 0.5;
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

    .crosshair {
    cursor: crosshair;
    }

    .crosshair path.wire {
    stroke: #DDDDDD;
    stroke-dasharray: 1, 1;
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
</style>
