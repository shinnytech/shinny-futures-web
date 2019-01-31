<template>
    <div class="user-trade">
        <SplitLeftRight :split="split">
            <template slot="left">
                <Form :label-width="60">
                    <FormItem label="合约" >
                        <AutoComplete clearable
                                      v-model="instrumentId"
                                      @on-search="querySearch"
                                      placeholder="请输入合约"
                                      style="width:200px">
                            <div class="auto-complete-search-result">
                                <Option v-for="item in searchResult" :value="item" :key="item">{{ item }}</Option>
                            </div>
                        </AutoComplete>
                    </FormItem>
                    <FormItem label="手数">
                        <InputNumber v-model="volume" :min="1" style="width:200px"></InputNumber>
                    </FormItem>
                    <FormItem label="价格">
                        <InputNumber v-model="limitPrice" :max="maxPrice" :min="minPrice"
                                     :step="priceTick" style="width:200px"></InputNumber>
                    </FormItem>
                    <FormItem>
                        <Button @click="insertOrder('BUY', 'OPEN')">买开</Button>
                        <Button style="margin-left: 8px" @click="insertOrder('SELL', 'OPEN')">卖开</Button>
                    </FormItem>
                    <FormItem>
                        <Button @click="insertOrder('BUY', 'CLOSE')">买平</Button>
                        <Button style="margin-left: 8px" @click="insertOrder('SELL', 'CLOSE')">卖平</Button>
                    </FormItem>
                </Form>
            </template>
            <template slot="right">
                <Tabs type="card" v-model="selectedTab" :animated=false>
                    <TabPane label="账户" name="accounts">
                        <table-accounts/>
                    </TabPane>
                    <TabPane label="持仓" name="positions">
                        <table-positions :height="height"/>
                    </TabPane>
                    <TabPane label="委托单" name="orders">
                        <table-orders :height="height"/>
                    </TabPane>
                    <TabPane label="成交记录" name="trades">
                        <table-trades :height="height"/>
                    </TabPane>
                </Tabs>
            </template>
        </SplitLeftRight>
    </div>
</template>
<script>
  import {mapGetters} from 'vuex'
  import SplitLeftRight from "@/components/SplitLeftRight.vue"
  import TableAccounts from "@/components/TableAccounts.vue"
  import TablePositions from "@/components/TablePositions.vue"
  import TableOrders from "@/components/TableOrders.vue"
  import TableTrades from "@/components/TableTrades.vue"

  export default {
    components: {
      TableAccounts,
      TablePositions,
      TableOrders,
      TableTrades,
      SplitLeftRight
    },
    data() {
      return {
        split: 0.3,
        searchResult: [],
        selectedTab: 'accounts', // accounts positions orders trades
        volume: 1,
        priceTick: 1,
        limitPrice: 0,
        priceDecs: 0,
        maxPrice: Infinity,
        minPrice: 0
      };
    },
    mounted() {
      this.$store.subscribe((mutation, state) => {
        // 订阅事件，任何地方选中某行，都会更新这个组件
        if (mutation.type === 'SET_SELECTED_SYMBOL') {
          let quote = this.$tqsdk.get_quote(mutation.payload)
          if (quote) {
            this.priceTick = Number(quote.price_tick)
            this.limitPrice = Number(quote.last_price)
            this.priceDecs = Number(quote.price_decs)
            this.maxPrice = quote.upper_limit === 0 ? Infinity : Number(quote.upper_limit)
            this.minPrice = quote.lower_limit === 0 ? 0 : Number(quote.lower_limit)
          }
        }
      })
    },
    computed: {
      height: function () {
        return (this.$root.windowHeight * (1 - this.$root.appSplit) - 44) + ''
      },
      instrumentId: {
        get: function () {
          return this.innerInstrumentId
        },
        set: function (v) {
          this.$store.commit('SET_SELECTED_SYMBOL', v)
        }
      },
      ...mapGetters({
        innerInstrumentId: 'getSelectedInstrumentId'
      })
    },
    methods: {
      querySearch (queryString, cb) {
        let results = []
        if (queryString && this.$tqsdk.isQuotesInfoReady){
          queryString = queryString.toLowerCase()
          for (let s in this.$tqsdk.quotesInfo) {
            let symbol = this.$tqsdk.quotesInfo[s]
            if (symbol.expired || symbol.class !== 'FUTURE') continue
            if (symbol.instrument_id.toLowerCase().includes(queryString) || symbol.ins_name.toLowerCase().includes(queryString)) results.push(symbol.instrument_id)
          }
          if (results.length === 0){
            for (let s in this.$tqsdk.quotesInfo) {
              let symbol = this.$tqsdk.quotesInfo[s]
              if (symbol.expired || symbol.class !== 'FUTURE') continue
              if (symbol.py.includes(queryString)) results.push(symbol.instrument_id)
            }
          }
        }
        this.searchResult = results
      },
      handleSelectInstrument (item) {},
      insertOrder (direction, offset) {
        let quote = this.$tqsdk.get_quote(this.instrumentId)
        console.log(this.limitPrice)
        this.$tqsdk.insert_order({
          exchange_id: quote.exchange_id,
          ins_id: quote.ins_id,
          direction: direction,
          offset: offset,
          limit_price: this.limitPrice,
          volume: this.volume
        })
      }
    }
  }
</script>
<style lang="scss">
    .user-trade {
        height: 100%;
        .split-pane {
            margin: 8px 2px 8px 6px;
            height: 100%;
            overflow: hidden;
        }
        .ivu-tabs-bar {
            margin-bottom: 6px;
        }
        .ivu-table-cell {
            padding-left: 10px;
            padding-right: 10px;
        }
    }
    .auto-complete-search-result {
        height: 200px;
    }
</style>
