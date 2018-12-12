<template>
    <Table :height="height" :columns="columns" :data="orders"></Table>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {FormatDatetime, FormatPrice, FormatDirection, FormatOffset, FormatStatus} from '@/plugins/utils'

  export default {
    data() {
      return {
        columns: [
          {
            title: '委托单ID',
            key: 'order_id',
            width: 180,
            fixed: 'left'
          },
          {
            title: '合约代码',
            key: 'instrument_id',
            width: 70,
            align: 'center'
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
            key: 'volume_orign',
            width: 50,
            align: 'right'
          },
          {
            title: '价格',
            key: 'limit_price',
            width: 70,
            align: 'right'
          },
          {
            title: '未成交',
            key: 'volume_left',
            width: 60,
            align: 'right'
          },
          {
            title: '操作',
            key: 'action',
            width: 80,
            align: 'center',
            render: (h, params) => {
              let btn = h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.handleCancelOrder(params.index, params.row)
                  }
                }
              }, '撤单')
              return params.row.status === 'ALIVE' ? h('div', [btn]) : h('div', [])
            }
          },
          {
            title: '状态',
            key: 'status',
            width: 100,
            align: 'center',
            render: (h, params) => {
              return params.row.status === 'FINISHED' ? h('div', '已完成') : h('div', '未完成')
            }
          },
          {
            title: '下单时间',
            key: 'insert_date_time',
            width: 160,
            align: 'right',
            render: (h, params) => {
              return h('div', FormatDatetime(params.row.insert_date_time))
            }
          },
          {
            title: '提示',
            key: 'last_msg',
            width: 180,
            align: 'right'
          }

        ]
      }
    },
    props: {
      height: {
        type: String,
      }
    },
    mounted() {
    },
    computed: {
      ...mapGetters({
        orders: 'orders/GET_ORDERS'
      })
    },
    methods: {
      filterStatus(value, row) {
        return row.status === value
      },
      handleCancelOrder(index, row) {
        this.$store.commit('CANCEL_ORDER', {
          order_id: row.order_id
        })
      },
      rowClick(row, event, column) {
        let symbol = row.exchange_id + '.' + row.instrument_id
        this.$store.commit('SET_SELECTED_SYMBOL', symbol)
      }
    }
  }
</script>
