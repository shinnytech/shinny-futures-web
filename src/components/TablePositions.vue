<template>
    <Table style="height: 100%" :columns="columns" :data="positions"></Table>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {FormatPrice} from '@/plugins/utils'
  export default {
    data() {
      return {
        columns: [
          {
            title: '合约代码',
            key: 'instrument_id',
            width: 80,
            fixed: 'left'
          },
          {
            title: '最新价',
            key: 'last_price',
            width: 80,
            align: 'right',
            fixed: 'left'
          },
          {
            title: '多仓',
            key: 'volume_long',
            width: 50,
            align: 'right',
            className: "col-buy"
          },
          {
            title: '开仓均价',
            key: 'open_price_long',
            width: 80,
            align: 'right',
            className: 'col-buy',
            render: this.formatterPrice
          },
          {
            title: '持仓盈亏',
            key: 'position_profit_long',
            width: 80,
            align: 'right',
            className: 'col-buy',
            render: this.formatterPrice
          },
          {
            title: '操作',
            key: 'action',
            width: 150,
            align: 'center',
            className: 'col-buy',
            render: this.genButtons
          },
          {
            title: '空仓',
            key: 'volume_short',
            width: 50,
            align: 'right',
            className: "col-sell"
          },
          {
            title: '开仓均价',
            key: 'open_price_short',
            width: 80,
            align: 'right',
            className: 'col-sell',
            render: this.formatterPrice
          },
          {
            title: '持仓盈亏',
            key: 'position_profit_short',
            width: 80,
            align: 'right',
            className: 'col-sell',
            render: this.formatterPrice
          },
          {
            title: '操作',
            key: 'action',
            width: 150,
            align: 'center',
            className: 'col-sell',
            render: this.genButtons
          },
          {
            title: '持仓占用',
            key: 'margin',
            width: 80,
            align: 'right',
            render: this.formatterPrice
          }
        ]
      }
    },
    props: {
      height: {
        type: String,
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    mounted() {},
    computed: {
      ...mapGetters({
        positions: 'positions/GET_POSITIONS'
      })
    },
    methods: {
        formatterPrice (h, params) {
            return h('div', FormatPrice(params.row[params.column.key]))
        },
        genButtons (h, params) {
          let type = params.column.className === 'col-buy' ? 'success' : 'error'
          let dir = params.column.className === 'col-buy' ? 'SELL' : 'BUY'
          return h('div', [
            h('Button', {
              props: {
                type: type,
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.handleClose(params.index, params.row, dir)
                }
              }
            }, '平仓'),
            h('Button', {
              props: {
                type: type,
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.handleCloseOpen(params.index, params.row, dir)
                }
              }
            }, '反手')
          ])
        },
        handleClose (index, row, direction) {
            let quote = this.$store.getters['quotes/GET_QUOTE'](row.exchange_id + '.' + row.instrument_id)
            let volume = direction === 'BUY' ? row.volume_short : row.volume_long
            this.$store.commit('INSERT_ORDER', {
              symbol: quote.instrument_id,
              exchange_id: quote.exchange_id,
              ins_id: quote.ins_id,
              direction: direction,
              offset: 'CLOSE',
              limitPrice: quote.last_price,
              volume: volume
            })
        },
        handleCloseOpen (index, row, direction) {
            let quote = this.$store.getters['quotes/GET_QUOTE'](row.exchange_id + '.' + row.instrument_id)
            let volume = direction === 'BUY' ? row.volume_short : row.volume_long
            this.$store.commit('INSERT_ORDER', {
              symbol: quote.instrument_id,
              exchange_id: quote.exchange_id,
              ins_id: quote.ins_id,
              direction: direction,
              offset: 'CLOSE',
              limitPrice: quote.last_price,
              volume: volume
            })
            this.$store.commit('INSERT_ORDER', {
              symbol: quote.instrument_id,
              exchange_id: quote.exchange_id,
              ins_id: quote.ins_id,
              direction: direction,
              offset: 'OPEN',
              limitPrice: quote.last_price,
              volume: volume
            })
        },
        rowClick (row, event, column) {
          let symbol = row.exchange_id + '.' + row.instrument_id
          this.$store.commit('SET_SELECTED_SYMBOL', symbol)
        }
    }
  }
</script>
