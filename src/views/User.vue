<template>
    <div style="height: 100%">
        <!-- 确认结算单 -->
        <confirm/>
        <!-- 未登录用户显示 -->
        <login v-if="tradingDay.length === 0"></login>
        <!-- 已登录用户显示 -->
        <trade v-else></trade>
    </div>
</template>

<script>
  import Trade from '@/components/UserTrade.vue'
  import Login from '@/components/UserLogin.vue'
  import Confirm from '@/components/UserConfirmSettlement.vue'
  export default {
    name: 'user',
    data() {
      return {}
    },
    components: {
      Trade,
      Login,
      Confirm
    },
    computed: {
      tradingDay () {
        return this.$store.state.trading_day
      }
    }
  }
</script>
