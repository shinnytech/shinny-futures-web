<template>
    <tr @click="handlerClick" @dblclick="handlerDbClick" >
        <!-- @contextmenu="handlerRowContextmenu" -->
        <td>
            <div>{{ins_name}}</div>
            <div class="appendix">{{ins_id}}</div>
        </td>
        <td v-for="(item, index) in tableCol" v-if="index > 0" :class="classNameStr(item)">
            <div class="data-content" :style="styleObj(item)" :data-content="formatter(item)"></div>
        </td>
    </tr>
</template>

<script>
    import {mapGetters} from 'vuex'
    import {DM, QuoteWs} from '@/store/websockets/index'


  export default {
    data() {
      return {
        priceDecs: 0,
        priceTick: 1,
        ins_id: '',
        ins_name: '',
        quote: {}
      }
    },
    components: {},
    props: {
        tableCol: {
            type: Array
        },
        symbol: {
            type: String
        },
        path: {
            type: String
        }
    },
    beforeMount() {
        this.quote = this.getQuote(this.symbol)
        this.priceDecs = this.quote.price_decs
        this.priceTick = this.quote.price_tick
        this.ins_name = this.quote.ins_name
        if (this.quote.class === "FUTURE_CONT") {
            this.ins_id = this.quote.underlying_symbol
        } else if (this.quote.class === "FUTURE_INDEX") {
            this.ins_id = this.quote.underlying_product
        } else {
            this.ins_id = this.quote.instrument_id
        }

//      this.quote = DM.getQuote(this.symbol)  //this.getQuote(this.symbol)
//      this.quote = this.getQuote(this.symbol)
//      DM.subscribe('quotes/' + this.symbol, this.update)
//      if (this.quote && this.quote.instrument_id === this.symbol ) {
//          this.priceDecs = this.quote.price_decs
//          this.priceTick = this.quote.price_tick
//          this.ins_name = this.quote.ins_name
//          if (this.quote.class === "FUTURE_CONT") {
//            this.ins_id = this.quote.underlying_symbol
//          } else if (this.quote.class === "FUTURE_INDEX") {
//            this.ins_id = this.quote.underlying_product
//          } else {
//            this.ins_id = this.quote.instrument_id
//          }
//      }
    },
    mounted() {
    },
    updated() {
    },
    beforeDestroy () {
    },
    computed: {
        ...mapGetters({
            getQuote: 'quotes/GET_QUOTE'
        })
    },
    methods: {
        classNameStr: function (item){
            if (typeof item['className'] === 'function') {
                return this.quote ? item['className'](this.quote) : ''
            } else {
                return item['className']
            }
        },
        styleObj: function (item){
             let styleObj = {}
             if (item['width']) {
                 styleObj['width'] = item['width'] + 'px'
             }
             return styleObj
        },
        formatter: function (item) {
            if (item.formatter) {
                return item.formatter(this.quote)
            }
            return this.quote[item.prop]
        },
        handlerClick: function () {
            this.$emit('rowClick',  this.quote)
        },
        handlerDbClick: function () {
            this.$emit('rowDbClick',  this.quote)
        },
        handlerRowContextmenu: function (e) {
            e.stopPropagation()
            e.preventDefault()
            this.$emit('rowContextmenu',  this.quote)
        },
      update: function (q){
//          console.log(this.quote)
      }
    }
  }
</script>
