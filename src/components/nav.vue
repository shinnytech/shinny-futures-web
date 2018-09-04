<template>
    <el-menu :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item id="brand"  index="1">
            <router-link  to="/">天勤衍生品研究</router-link>
        </el-menu-item>
        <el-menu-item index="2" style="float:right;">
            <div v-if="judge_login"><router-link to="/login">{{loginStatus}}</router-link></div>
            <div v-else>{{loginStatus}}</div>
        </el-menu-item>
    </el-menu>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "1",
      activeIndex2: "1"
    };
  },
  computed: {
      judge_login(){ return window.account_id===undefined},
    loginStatus() {
      return window.account_id===undefined ? "登录" : "欢迎您, "+window.account_id;
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    }
  },
  mounted() {
    console.log("login");
    console.log(this.$store);
  }
};
</script>
<style scoped>
a {
  text-decoration: none;
  line-height: 60px;
  display: inline-block;
}

a:hover {
  cursor: pointer;
}

.el-menu-item:hover {
  cursor: pointer;
}

#brand {
  border-bottom: 0px solid #409eff;
  color: white;
  background-color: black;
  font-weight: bold;
  font-size: 18px;
}
</style>