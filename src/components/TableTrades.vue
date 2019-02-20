<template>
    <Table :height="height" :columns="columns" :data="tradesArr"></Table>
</template>

<script>
  import {FormatDatetime, FormatPrice, FormatDirection, FormatOffset, ObjectToArray} from '@/plugins/utils'

  export default {
    data() {
      return {
        tradesArr: [],
        columns: [
          {
            title: '委托单ID',
            key: 'order_id',
            width: 180,
            fixed: 'left'
          },
          {
            title: '交易所单号',
            key: 'exchange_trade_id',
            width: 100,
            align: 'left'
          },
          {
            title: '合约代码',
            key: 'instrument_id',
            width: 100,
            align: 'left'

//    :filters="filtersObj"
//    :filter-method="filterInstrumentId"
//      filter-placement="bottom-end"
          },
          {
            title: '方向',
            key: 'direction',
            width: 50,
            align: 'center',
            render: (h, params) => {
              return h('div', FormatDirection(params.row.direction))
            }
          },
          {
            title: '开平',
            key: 'offset',
            width: 50,
            align: 'center',
            render: (h, params) => {
              return h('div', FormatOffset(params.row.offset))
            }
          },
          {
            title: '手数',
            key: 'volume',
            width: 50,
            align: 'right'
          },
          {
            title: '价格',
            key: 'price',
            width: 70,
            align: 'right',
            render: (h, params) => {
              return h('div', FormatPrice(params.row.price))
            }
          },
          {
            title: '时间',
            key: 'trade_date_time',
            width: 160,
            align: 'right',
            render: (h, params) => {
              return h('div', FormatDatetime(params.row.trade_date_time))
            }
          },
          {
            title: '手续费',
            key: 'commission',
            width: 80,
            align: 'right'
          },
        ]
      }
    },
    props: {
      height: {
        type: String,
      }
    },
    mounted() {
      this.$on('tqsdk:rtn_data', function(){
        let trades = this.$tqsdk.get_trades()
        if (this.$tqsdk.is_changed(trades)) {
          ObjectToArray(trades, this.tradesArr, 'trade_id', ()=>1)
        }
      })
    },
    methods: {
      filterInstrumentId(value, row) {
        return row.instrument_id === value
      }
    }
  }
</script>
