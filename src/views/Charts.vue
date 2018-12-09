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
    data () {
      return {
        instrumentId: this.$route.params.instrument_id
      }
    },
    computed: {
      height: function () {
        console.log(this.$root.windowHeight * this.$root.appSplit)
        return this.$root.windowHeight * this.$root.appSplit
      }
    },
    created: function () {},
    mounted: function () {
      // this.onKeyChange(13);//enter
      // this.onKeyChange(27);//esc
      // this.onKeyChange(96) // ~

//      if (typeof this.$tv_obj == "undefined") {
//        // Tv.init({ symbol: "SHFE.cu1809", interval: "1D" });
//        TradeView.init({
//          symbol: this.$route.params.instrument_id || "SHFE.cu1809",
//          interval: "1D"
//        });
//        TradeView.subscribe_tq(TQ);
//        this.$tv_obj = TradeView;
//      } else {
//        TradeView.setSymbol(this.$route.params.instrument_id);
//      }
    },
    methods: {
      goBack () {
        this.$router.go(-1)
      },
      onKeyChange (keyCode) {
        var that = this
        if (document.addEventListener) {
          document.addEventListener('keypress', keyPressHandler, true)
        } else {
          document.attachEvent('onkeypress', keyPressHandler)
        }

        function keyPressHandler (evt) {
          if (evt.keyCode === keyCode) {
            // 为按下回车时调用的方法
            that.goBack()
          }
        }
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
