<template>
<div class="tq-table-container" @scroll="handleScroll" :style="{height:'100%'}">
    <table id="QuotesTable">
        <thead>
            <tr>
            	<td v-for="item in tableCol">
            		<div :style="computeStyleObj(item)">{{item['name']}}</div>
            	</td>
            </tr>
        </thead>
        <tbody>
            <table-row v-for="(item, index) in contentList" :key="item" :symbol="item" :path="rootPath + item + '/'" :tableCol="tableCol"
            @rowClick="rowClick" @rowDbClick="rowDbClick"
            :class="{selected: item === selectedSymbol}"></table-row>
        </tbody>
    </table>
</div>
</template>

<script>
  import TableRow from './TableQuotesRow.vue'
  export default {
    data() {
      return {
        selectedSymbol: ''
      }
    },
    components: {
		TableRow
    },
    props: {
    	height: {
			type: String
    	},
        tableCol: {
            type: Array
        },
        contentList: {
            type: Array
        },
        rootPath: {
            type: String
        }
    },
    beforeMount() {
    },
    beforeUpdate() {
    },
    updated() {
    },
    mounted() {
    },
    beforeDestroy() {
    },
    computed: {},
    methods: {
    	handleScroll: function (e) {
    		// console.log(e.target.scrollLeft, e.target.scrollTop)
    	},
    	computeStyleObj: function (item){
    		let styleObj = {}
    		if (item['width']) {
    			styleObj['width'] = item['width'] + 'px'
    		}
    		return styleObj
    	},
        rowClick (quote) {
            this.$store.commit('SET_SELECTED_SHOW_SYMBOL', quote.instrument_id)
        	if (quote.class === 'FUTURE') {
        		this.$store.commit('SET_SELECTED_SYMBOL', quote.instrument_id)
        	} else if (quote.class === 'FUTURE_CONT') {
        		this.$store.commit('SET_SELECTED_SYMBOL', quote.underlying_symbol)
        	}
            this.selectedSymbol = quote.instrument_id
        },
        rowDbClick (symbol) {
          	this.$router.push({ name: 'charts', params: { instrument_id: symbol.instrument_id }})
        },
        cellStyle ({row, column, rowIndex, columnIndex}) {
          if (['最新价', '涨跌', '涨跌幅', '今开盘', '最高价', '最低价'].includes(column.label) && row.change%1 === 0 && row.change !== 0) {
            return {
              color: row.change > 0 ? 'red' : 'green'
            }
          }
          return {
            color: 'black'
          }
        }
    }
  }
</script>

<style lang="scss">
    .tq-table-container {
        width: 100%;
        overflow: scroll;
        padding-left: 4px;
        margin-left: -4px;
        &::-webkit-scrollbar {
            width: 0 !important;
            height: 12px;
        }
        &::-webkit-scrollbar-thumb {
            height: 12px;
            background: #b7b7b7;
        }
        table {
	        border-spacing: 0px;
            color: $text-color-1st;
	    }
        table tr.selected td {
            background: #effefe;
        }
	    // 首行
	    table thead th,
	    table thead td {
	        border-top: 1px solid $table-border-color;
            background-color: $area-header-color;
	        position: sticky;
	        top: 0;
	        z-index: 20;
	        &:first-child {
	            z-index: 21;
	            left: 0;
	        }
	        // 首行文字样式
	        font-weight: 600;
	        text-align: center;
	    }
	    // 首列
	    table tbody th:first-child,
	    table tbody td:first-child {
	        border-left: 1px solid $table-border-color;
	        position: sticky;
	        text-align: left;
	        left: 0;
	        z-index: 19;
	    }
	    table th,
	    table td {
	        padding: 5px 8px;
	        white-space: nowrap;
	        border-bottom: 1px solid $table-border-color;
	        border-right: 1px solid $table-border-color;
	        // 默认单元格样式
	        text-align: right;
	        background-color: $area-background-color;
	        font-size: 14px;

	        // 某一列的背景色
	        &.col-buy {
			    background-color: $text-bgcolor-R
			}
			&.col-sell {
			    background-color: $text-bgcolor-G
			}
			// 某一格文字颜色
			&.R {
				color: $text-color-R
			}
			&.G {
			    color: $text-color-G
			}
			// 默认单元格宽度
			div {
				width: 100px;
			}
            div.appendix {
                font-size: 10px;
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
