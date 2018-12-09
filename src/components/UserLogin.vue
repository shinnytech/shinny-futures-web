<template>
    <div class="user-login">
        <Alert type="error" v-if="showLoginError" show-icon closable>
            等待回应超时,可能的原因 (1)服务器正在运维，(2)网络不通，无法连接服务器，请稍后/检查网络后重试。
        </Alert>
        <Form ref="userForm" :model="userForm" :rules="rules" :label-width="80">
            <FormItem label="期货公司" prop="bid">
                <Select v-model="userForm.bid">
                    <Option v-for="item in brokers" :value="item" :key="item">{{ item }}</Option>
                </Select>
            </FormItem>
            <FormItem label="账号" prop="user_name">
                <Input v-model="userForm.user_name" placeholder="请输入账号"></Input>
            </FormItem>
            <FormItem label="密码" prop="password">
                <Input type="password" v-model="userForm.password" placeholder="请输入密码"></Input>
            </FormItem>
            <FormItem>
                <Button @click="onSubmit('userForm')" :loading="loading" type="primary">
                    登录
                </Button>
            </FormItem>
        </Form>
    </div>
</template>
<script>
  import {mapGetters} from 'vuex'
  import {DefaultUser} from '@/config'

  export default {
    name: 'userLogin',
    data() {
      return {
        userForm: Object.assign({
          bid: '',
          user_name: '',
          password: ''
        }, DefaultUser),
        rules: {
          bid: [
            {required: true, message: '请选择期货公司', trigger: 'blur'}
          ],
          user_name: [
            {required: true, message: '请输入账户', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'}
          ]
        },
        loading: false,
        showLoginError: false
      }
    },
    computed: {
      ...mapGetters({
        brokers: 'getBrokers'
      })
    },
    methods: {
      onSubmit(form) {
        this.loading = true
        this.$refs[form].validate((valid) => {
          if (!valid) return
          this.$store.commit('LOGIN', {
            bid: this.userForm.bid,
            user_name: this.userForm.user_name,
            password: this.userForm.password
          })
          setTimeout((function () {
            if (this.$store.state.trading_day.length === 0) {
              this.loading = false
              this.showLoginError = true
            }
          }).bind(this), 10000)
        })
      }
    }
  }
</script>
<style lang="scss">
    .user-login {
        text-align: center;
        .ivu-alert {
            width: 700px;
            margin: 16px auto;
        }
        .ivu-form {
            width: 280px;
            margin: 16px auto;
        }
    }
</style>
