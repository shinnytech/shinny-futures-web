<template>
	<el-container>
		<el-main>
			<el-form v-model="user">
				<div class="title">登录</div>
				<el-form-item label="选择期货公司" prop="typeId">
					<el-select v-model="user.bid" placeholder="请选择">
						<el-option v-for="(item,index) in items" :label="item" :value="item" :key="index"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="" prop="name">
					<el-input placeholder="账号" v-model="user.user_name"></el-input>
				</el-form-item>
				<el-form-item label="" prop="pwd">
					<el-input placeholder="密码" v-model="user.password"></el-input>
				</el-form-item>
				<el-button type="primary" :loading="loading" @click="onSubmit">立即登录</el-button>
			</el-form>
		</el-main>
	</el-container>
</template>
<script>
	export default {
		data() {
			return {
				user: {
					user_name: "",
					password: ""
				},
				items: [],
				loading: false,
				login_success: false,
				login_connect_trade_front: false,
				rules: {
					typeId: [],
					name: [{
						required: true,
						message: "请输入账号",
						trigger: "blur"
					},
						{
							min: 3,
							max: 20,
							message: "长度在 3 到 20 个字符",
							trigger: "blur"
						}
					],
					pwd: [{
						required: true,
						message: "请输入密码",
						trigger: "blur"
					},
						{
							min: 3,
							max: 20,
							message: "长度在 3 到 20 个字符",
							trigger: "blur"
						}
					]
				}
			};
		},
		methods: {
			check_login() {
				console.log("check_login:" + this.user.user_name);
				var session_data = TQ.dm.get("trade", this.user.user_name, "session");
				if (session_data === undefined) {
					setTimeout(() => this.check_login(), 1000);
					return 0;
				}
				this.login_success = true;

				window.account_id = this.user.user_name;
				this.$notify({
					title: "成功",
					message: "登录成功",
					type: "success"
				});

				this.$store.commit("doLogin", "evt.data.session_id");
				this.loading = false;
				this.$router.push({
					path: "/"
				});
				return 0;
			},

			check_login_timeout() {
				var notify_data = TQ.dm.datas.notify;
				if (notify_data === undefined || notify_data.length === 0) {
					this.$notify({
						title: "请求超时",
						message: "等待回应超时，可能的原因 (1)服务器正在运维，(2)网络不通，无法连接服务器，请稍后/检查网络后重试。",
						type: "warning",
						mode: "html",
						permanent: true
					});
					this.loading = false;
					return 0;
				}
			},

			set_broker_list() {
				if (!(window.broker_list === undefined)) {
					this.items = window.broker_list;
				} else {
					setTimeout(() => this.set_broker_list(), 1000);
				}
			},

			onSubmit() {
				this.loading = true;
				let {
					bid,
					user_name,
					password
				} = this.user;

				if (bid === undefined) {
					this.$notify({
						title: "错误",
						message: "请选择期货公司",
						type: "error"
					});
					this.loading = false;
					return 0;
				}
				else if( user_name.length == 0 ){
					this.$notify({
						title: "错误",
						message: "请输入用户名",
						type: "error"
					});
					this.loading = false;
					return 0;
				}
				else if( password.length == 0 ){
					this.$notify({
						title: "错误",
						message: "请输入密码",
						type: "error"
					});
					this.loading = false;
					return 0;
				}

				//模拟登陆成功
				// this.$store.commit("doLogin", "evt.data.session_id");
				// this.loading = false;
				// this.$router.push({ path: "/" });

				TQ.trade_login(bid, user_name, password);
				setTimeout(() => this.check_login_timeout(), 20000);
				this.check_login();
			}
		},
		mounted() {
			console.log(this.$store.state.session_id);

			this.set_broker_list();

			if (this.$store.state.session_id) {
				this.$router.go(-1);
			}
		}
	};

</script>
<style scoped>
	.el-main {
		justify-content: center;
		display: flex;
	}

	.el-form {
		width: 290px;
		margin-top: 120px;
		background-color: white;
		box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
		0 1px 5px 0 rgba(0, 0, 0, 0.12);
		padding: 32px;
	}

	.title {
		margin-bottom: 32px;
		font-size: 24px;
		font-weight: bold;
		color: #4c4848;
	}

	.el-form-item {
		margin-bottom: 40px;
	}

	.el-form-item__content {
		display: inline-block !important;
		width: 250px !important;
	}

</style>
