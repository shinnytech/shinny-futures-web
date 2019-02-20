<template>
    <tr @click="handlerClick" @dblclick="handlerDbClick" >
        <!-- @contextmenu="handlerRowContextmenu" -->
        <td>
            <div>{{ins_id}}</div>
            <!--<div class="appendix">{{ins_id}}</div>-->
        </td>
        <td v-for="(item, index) in tableCol" v-if="index > 0" v-bind:key="index" :class="classNameStr(item)">
            <div class="data-content" :style="styleObj(item)" :data-content="formatter(item)"></div>
        </td>
    </tr>
</template>

<script>
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
        this.quote = this.$tqsdk.get_quote(this.symbol)
        this.priceDecs = this.quote.price_decs
        this.priceTick = this.quote.price_tick
        this.ins_name = this.quote.ins_name
        let matchlist = this.symbol.match(/KQ\.[im]@([a-zA-Z]+)\.([a-zA-Z]+)/)
        if (matchlist && matchlist[2]) {
          if (this.quote.class === "FUTURE_CONT"){
            this.ins_id = matchlist[2] + '主连 (' + this.quote.underlying_symbol.split('.')[1] + ')'
          }
          if (this.quote.class === "FUTURE_INDEX") this.ins_id = matchlist[2] + '指数'
        } else {
            this.ins_id = this.quote.ins_id
        }
    },
    mounted() {
      this.$on('tqsdk:rtn_data', function(){
        if (this.$tqsdk.is_changed(this.quote)){
          this.$forceUpdate()
        }
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
        }
    }
  }
</script>
