<template>
	<div class="user-login">
		<Alert type="error" v-if="showLoginError" show-icon closable @on-close="onclose">
			{{ errorMsg }}
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
	import {DefaultUser} from '@/config'

	let defaultErrMsg = '等待回应超时,可能的原因 (1)服务器正在运维，(2)网络不通，无法连接服务器，请稍后/检查网络后重试。'

	export default {
		name: 'userLogin',
		data() {
			return {
				brokers: [],
				errorMsg: defaultErrMsg,
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
		mounted: function () {
			this.$on('tqsdk:rtn_brokers', function (brokers) {
				this.brokers = brokers
			})
		},
		methods: {
			onclose() {
				this.showLoginError = false
			},
			onSubmit(form) {
				this.loading = true
				this.$refs[form].validate((valid) => {
					if (!valid) return
					this.$tqsdk.login({
						bid: this.userForm.bid,
						user_id: this.userForm.user_name,
						password: this.userForm.password
					})

					let timeout = setTimeout((function () {
						if (!this.$tqsdk.is_logined()) {
							this.loading = false
							this.showLoginError = true
							this.errorMsg = defaultErrMsg
						}
					}).bind(this), 10000)

					this.$on('tqsdk:rtn_data', function () {
						if (this.$tqsdk.is_logined()) {
							this.loading = false
							this.showLoginError = false
							this.$store.commit('SET_LOGIN', true)
							clearTimeout(timeout)
						}
					})

					this.$on('tqsdk:notify', function (notify) {
						if (notify.level === 'WARNING' || notify.level === 'ERROR') {
							this.loading = false
							this.showLoginError = true
							this.errorMsg = notify.content
						}
					})
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
