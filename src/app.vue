<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "app"
};
</script>

<style>
body {
  margin: 0px;
  background-color: #e9eef3;
  height: 100%;
}

#app {
  font-family: Helvetica, sans-serif;
  text-align: center;
  margin: 0px;
  padding: 0px;
}
.el-table {
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  margin-bottom: 12px;
}
.el-main {
  padding: 12px !important;
}

div.el-table__header-wrapper > table > thead {
  line-height: 24px;
}
/* .el-icon-loading {
  font-size: 40px;
  margin-bottom: 12px;
} */

.el-table td,
.el-table th {
  padding: 8px 0 !important;
}

.className {
  background-color: red;
}
</style>