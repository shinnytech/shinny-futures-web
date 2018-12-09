<template>
    <div class="accounts-container">
        <Table :columns="columns1" :data="[account]"></Table>
        <Table :columns="columns2" :data="[account]"></Table>
    </div>
</template>
<script>
  import {mapGetters} from 'vuex'

  export default {
    data() {
      let fieldsName = { // 字段名称
        'balance': '账户权益',
        'available': '可用资金',
        'pre_balance': '账户权益',
        'deposit': '入金金额',
        'withdraw': '出金金额',
        'commission': '手续费',
        'premium': '权利金',
        'static_balance': '静态权益',
        'position_profit': '持仓盈亏',
        'float_profit': '浮动盈亏',
        'risk_ratio': '风险度',
        'margin': '占用资金',
        'frozen_margin': '冻结保证金',
        'frozen_commission': '冻结手续费',
        'frozen_premium': '冻结权利金',
        'close_profit': '平仓盈亏'
      }
      return {
        columns1: [
          {
            title: fieldsName['balance'],
            key: 'balance'
          },
          {
            title: fieldsName['available'],
            key: 'available'
          },
          {
            title: fieldsName['pre_balance'],
            key: 'pre_balance'
          },
          {
            title: fieldsName['deposit'],
            key: 'deposit'
          },
          {
            title: fieldsName['withdraw'],
            key: 'withdraw'
          },
          {
            title: fieldsName['commission'],
            key: 'commission'
          }
        ],
        columns2: [
          {
            title: fieldsName['static_balance'],
            key: 'static_balance'
          },
          {
            title: fieldsName['position_profit'],
            key: 'position_profit'
          },
          {
            title: fieldsName['float_profit'],
            key: 'float_profit'
          },
          {
            title: fieldsName['close_profit'],
            key: 'close_profit'
          },
          {
            title: fieldsName['margin'],
            key: 'margin'
          },
          {
            title: fieldsName['risk_ratio'],
            key: 'risk_ratio'
          }
        ]
      }
    },
    computed: {
      ...mapGetters({
        account: 'accounts/GET_ACCOUNT'
      })
    }
  }
</script>
<style scoped lang="scss">
    .accounts-container {
        width: 100%;
    }
</style>
