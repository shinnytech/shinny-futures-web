<template>
    <div class="tickslist-container" :style="{height:height}">
      <table>
        <thead>
          <tr>
            <td>时间</td>
            <td>价位</td>
            <td>现手</td>
            <td>增仓</td>
            <td>开平</td>
          </tr>
        </thead>
        <tbody v-if="quote">
          <tr v-for="(item, index) in ticks" :key="index">
            <td>{{item.dt}}</td>
            <td :class="item.textColor">{{item.price}}</td>
            <td :class="item.textColor">{{item.vol}}</td>
            <td>{{item.oi}}</td>
            <td :class="item.textColor">{{item.msg}}</td>
          </tr>
        </tbody>
      </table>
    </div>
</template>
<script>
import { FormatPrice, FormatDatetime } from '@/plugins/utils'
import { DM } from '@/store/websockets/index'
export default {
  data () {
    return {
      ticks: []
    }
  },
  watch: {
    instrumentId: {
      handler (newVal, oldVal) {
        console.log('instrumentId change')
        this.$store.commit('SET_TICK_CHART', { symbol: newVal })
        this.ticks.splice(0)
        DM.unsubscribe('ticks/' + oldVal, this.update)
        DM.subscribe('ticks/' + newVal, this.update)
        this.update(DM.getByPath('ticks/' + newVal))
      },
      immediate: true
    }
  },
  props: {
    instrumentId: String,
    height: String
  },
  computed: {
    quote: function () {
      return this.$store.getters['quotes/GET_QUOTE'](this.instrumentId)
    }
  },
  methods: {
    genOneTick: function (i, ticks) {
      let originTick = ticks.data[i]
      let originPreTick = ticks.data[i - 1]
      if (this.quote && originTick && originPreTick && originTick.volume - originPreTick.volume > 0) {
        let vol_diff = originTick.volume - originPreTick.volume
        let oi_diff = originTick.open_interest - originPreTick.open_interest
        let result = {
          datetime: originTick.datetime,
          dt: FormatDatetime(originTick.datetime).slice(11, 19),
          price: FormatPrice(originTick.last_price, this.quote.price_decs),
          vol: vol_diff,
          oi: oi_diff,
          msg: '',
          textColor: ''
        }
        let price_diff = originTick.last_price - originPreTick.last_price
        let pc = 0
        if (originTick.last_price >= originPreTick.ask_price1) {
          pc = 1
        } else if (originTick.last_price <= originPreTick.bid_price1) {
          pc = -1
        } else {
          pc = price_diff > 0 ? 1 : price_diff < 0 ? -1 : 0
        }

        if (oi_diff > 0 && oi_diff === vol_diff) {
          result.msg = '双开'
        } else if (oi_diff < 0 && oi_diff + vol_diff === 0) {
          result.msg = '双平'
        } else {
          result.msg = pc === 0 ? '换手' : ((pc > 0 ? '多' : '空') + (oi_diff > 0 ? '开' : oi_diff < 0 ? '平' : '换'))
        }
        switch (result.msg) {
          case '双开':
          case '双平':
            result.textColor = pc === 1 ? 'R' : pc === -1 ? 'G' : ''
            break
          case '多开':
          case '多换':
          case '空平':
            result.textColor = 'R'
            break
          case '空开':
          case '空换':
          case '多平':
            result.textColor = 'G'
            break
          default:
            result.textColor = ''
            break
        }
        return result
      } else {
        return null
      }
    },
    update: function (ticks) {
      let length = 50
      let index = 0
      if (ticks && ticks.last_id > 0) {

        if (this.ticks.length === 0 ){
          this.last_id = ticks.last_id
          for (var i = ticks.last_id; i >= 0; i--) {
            let temp = this.genOneTick(i, ticks)
            if (temp !== null) {
              this.$set(this.ticks, index, temp)
              index++
              if (index === length) break
            }
          }
        } else if (this.last_id < ticks.last_id){
          let temp = this.genOneTick(ticks.last_id, ticks)
          if (temp !== null && temp.datetime > this.ticks[0].datetime) {
            this.ticks.splice(0, 0, temp)
          }
        }
      }
    }
  }
}
</script>
<style scoped lang="scss">
    .tickslist-container {
        overflow-y: scroll;
        overflow-x: hidden;
        height: 100%;
        margin: 4px 6px 4px 2px;

        table {
          border-radius: 4px;
          border-spacing: 0px;
          width: 100%;
            height: 100%;
        }
        // 首行
        table thead th,
        table thead td {
            border-top: 1px solid $table-border-color;
            background-color: $area-header-color ;
            position: sticky;
            top: 0;
            z-index: 20;
            // 首行文字样式
            font-weight: 600;
            text-align: center;
            color: $text-color-2nd;
        }
        // 首列
        table tbody th:first-child,
        table tbody td:first-child {
            text-align: left;
            left: 0;
            z-index: 19;
        }
        table th,
        table td {
            padding: 3px 4px;
            white-space: nowrap;
            border-bottom: 1px solid $table-border-color;
            // 默认单元格样式
            text-align: right;
            background-color: $area-background-color ;
            color: $text-color-1st;
            font-size: 14px;
            // 某一列的背景色
            &.col-buy {
                background-color: #fff0f0
            }
            &.col-sell {
                background-color: #f0fff0
            }
            // 某一格文字颜色
            &.R {
                color: $text-color-R
            }
            &.G {
                color: $text-color-G
            }
            // 默认单元格宽度
            div.appendix {
                font-size: 10px;
                color: #666;
            }
            div.data-content:after {
              content: attr(data-content);
            }
      }
      table tr.selected {
        // 选中行背景色
          background-color: #f0f0ff
      }
    }

</style>
