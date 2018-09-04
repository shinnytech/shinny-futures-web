<template>
  <el-table
  :data="tableData"
  :height="height"
  :cell-style="cell_style"
  border
  stripe
  v-loading="loading"
  @cell-click="cellClick"
  @cell-dblclick="cellDblclick">
    <el-table-column
    :prop="item.prop"
    :label="item.label"
	:align="item.align"
	:width="item.width"
    sortable
    v-for="(item,index) in tableHeader"
    :key="index"
    v-bind:formatter="item.formatter">
    <!--:class-name="item.class"-->
    <!--:formatter="item.formatter">-->
    </el-table-column>

    <!-- <el-table-column>
      <template slot-scope="scope">
        <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
      </template>
    </el-table-column> -->
  </el-table>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    tableData: {
      type: Array
    },
    tableHeader: {
      type: Array
    },
    loading: {
      type: Boolean,
      default: false
    },
    height: {
      // default: (window.innerHeight - 61) / 3 - 16 || 200
    },
    formatter: {
      //type: String
    },
      cell_style:{

      }
  },
  mounted() {
    //console.log("this.formatter", this.formatter);
  },
  methods: {
    cellClick(row, column, cell, event) {
      this.$emit("cellClick", row);
    },
    cellDblclick(row, column, cell, event) {
      this.$emit("cellDblclick", row);
    },
      // cell_style: function(row, column, rowIndex, columnIndex){
      //     // console.log(1111111111)
      //     // console.log(row.color)
      //     // return 'background-color:'+row.color;
      // }
  }
};
</script>
