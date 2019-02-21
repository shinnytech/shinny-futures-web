<template>
	<Layout id="shinny-app">
		<Sider class="sider" width="42">
			<Tooltip v-if="isShowBackBtn" content="返回" placement="right">
				<Button type="text" size='small' @click="$router.go(-1)">
					<Icon type="md-return-left" size="24"/>
				</Button>
			</Tooltip>
			<Tooltip content="设置" placement="right">
				<Button type="text" size='small' @click="isShowSettingModel = true">
					<Icon type="md-settings" size="24"/>
				</Button>
				<Modal v-model="isShowSettingModel"
					   title="设置"
					   :scrollable="true"
					   @on-ok="onClickOk"
					   @on-cancel="onClickCancel"
					   @on-visible-change="onVisibleChange"
				>

				</Modal>
			</Tooltip>
			<Tooltip content="打开天勤主页" placement="right">
				<Button type="text" size='small' to="https://www.shinnytech.com/tianqin/" target="_blank">
					<Icon type="md-home" size="24"/>
				</Button>
			</Tooltip>

		</Sider>
		<Content class="content">
			<Split v-model="$root.appSplit" mode="vertical">
				<div slot="top" class="split-pane">
					<keep-alive>
						<router-view name="quotes"></router-view>
					</keep-alive>
				</div>
				<div slot="trigger" class="split-horizontal">
					<div class="split-horizontal-dots">
						<span class="dot"></span>
						<span class="dot"></span>
						<span class="dot"></span>
						<span class="dot"></span>
						<span class="dot"></span>
					</div>
				</div>
				<div slot="bottom" class="split-pane">
					<router-view name="user"></router-view>
				</div>
			</Split>
		</Content>
	</Layout>
</template>
<script>
	export default {
		data() {
			return {
				isShowSettingModel: false
			}
		},
		methods: {
			showSettingModel() {
			},
			onClickOk() {
				// todo: 确定新参数
				console.log('onClickOk')
			},
			onClickCancel() {
				// todo: 改回原来参数
				console.log('onClickCancel')
			},
			onVisibleChange(visible) {
				console.log(visible)
				if (visible) {

				} else {

				}
			}
		},
		computed: {
			isShowBackBtn() {
				return this.$route.name === 'charts'
			}
		},
		beforeCreate: () => {
			// 在实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前被调用。
		},
		created: () => {
			// 在实例创建完成后被立即调用。在这一步，实例已完成以下的配置：数据观测 (data observer)，属性和方法的运算，watch/event 事件回调。然而，挂载阶段还没开始，$el 属性目前不可见。
		},
		beforeMount: () => {
			// 在挂载开始之前被调用：相关的 render 函数首次被调用。
		},
		mounted: function () {
			// el 被新创建的 vm.$el 替换，并挂载到实例上去之后调用该钩子。如果 root 实例挂载了一个文档内元素，当 mounted 被调用时 vm.$el 也在文档内。
			// 注意 mounted 不会承诺所有的子组件也都一起被挂载。

			this.$on('tqsdk:notify', function (notify) {
				if (notify.level === 'INFO') {
					if (notify.type === 'SETTLEMENT') {
						this.$store.commit('SET_SETTLEMENT', notify)
					} else if (notify.type === 'MESSAGE') {
						this.$Message.info(notify.content)
					}
				} else if (notify.level === 'WARNING' || notify.level === 'ERROR') {
					this.$Message.error(notify.content)
				}
			})
		},
		beforeUpdate: () => {
			// 数据更新时调用，发生在虚拟 DOM 打补丁之前。这里适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。
		},
		updated: () => {
			// 由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。
			// 当这个钩子被调用时，组件 DOM 已经更新，所以你现在可以执行依赖于 DOM 的操作。然而在大多数情况下，你应该避免在此期间更改状态。如果要相应状态改变，通常最好使用计算属性或 watcher 取而代之。
			// 注意 updated 不会承诺所有的子组件也都一起被重绘。
		},
		activated: () => {
			// keep-alive 组件激活时调用。
		},
		deactivated: () => {
			// keep-alive 组件停用时调用。
		},
		beforeDestroy: () => {
			// 实例销毁之前调用。在这一步，实例仍然完全可用。
		},
		destroyed: () => {
			// Vue 实例销毁后调用。调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。
		},
		errorCaptured: (err, vm, info) => {
			console.error('App.errorCaptured', err, vm, info)
			return false
		}
	}
</script>

<style lang="scss">
	html,
	body {
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	#shinny-app {
		height: 100%;
		width: 100%;
		overflow: hidden;
		position: absolute;

		> .sider {
			overflow-x: hidden;
			background-color: #ffffff;
			text-align: center;
			border-right: 6px solid $page-background-color;
			&::-webkit-scrollbar {
				width: 0 !important;
				height: 0 !important;
			}
		}

		> .content {
			height: 100%;
			overflow: hidden;
			background-color: #ffffff;
			&::-webkit-scrollbar {
				width: 0 !important;
				height: 0 !important;
			}
			.split-horizontal {
				width: 100%;
				height: 6px;
				background-color: $page-background-color;
				cursor: row-resize;
				.split-horizontal-dots {
					left: 50%;
					top: 1px;
					width: 40px;
					position: absolute;
					overflow: hidden;
					.dot {
						background-color: darken($page-background-color, 30%);
						height: 4px;
						width: 4px;
						border-radius: 2px;
						float: left;
						margin-right: 3px;
					}
				}
			}

			.split-pane {
				height: 100%;
			}
		}

		// fix iview bug 水平分割块
		.ivu-split-horizontal > .ivu-split-trigger-con {
			height: 100%;
			width: 0;
		}
	}
</style>
