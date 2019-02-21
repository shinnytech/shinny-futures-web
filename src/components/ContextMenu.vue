<script>
	export default {
		name: 'context-menu',
		render: function (createElement) {
			let aList = []
			for (var i = 0; i < this.contentlist.length; i++) {
				this.contentlist[i]
			}
			return createElement('a', 'hello')
		},
		data() {
			return {
				triggerShowFn: () => {
				},
				triggerHideFn: () => {
				},
				x: null,
				y: null,
				style: {},
				binded: false
			}
		},
		props: {
			show: Boolean,
			contextList: Array,
			contextMenuEvent: Object
		},
		mounted() {
			console.log('context-menu mounted')
			// this.bindEvents()
		},
		methods: {
			handlerClick(item) {
				return function (event) {
					console.log(event, item)
				}
			},
			// 初始化事件
			bindEvents() {
				this.$nextTick(() => {
					if (!this.target || this.binded) return
					this.triggerShowFn = this.contextMenuHandler.bind(this)
					this.target.addEventListener('contextmenu', this.triggerShowFn)
					this.binded = true
				})
			},
			// 取消绑定事件
			unbindEvents() {
				if (!this.target) return
				this.target.removeEventListener('contextmenu', this.triggerShowFn)
			},
			// 绑定隐藏菜单事件
			bindHideEvents() {
				this.triggerHideFn = this.clickDocumentHandler.bind(this)
				document.addEventListener('mousedown', this.triggerHideFn)
				document.addEventListener('mousewheel', this.triggerHideFn)
			},
			// 取消绑定隐藏菜单事件
			unbindHideEvents() {
				document.removeEventListener('mousedown', this.triggerHideFn)
				document.removeEventListener('mousewheel', this.triggerHideFn)
			},
			// 鼠标按压事件处理器
			clickDocumentHandler(e) {
				this.$emit('update:show', false)
			},
			// 右键事件事件处理
			contextMenuHandler(e) {
				this.x = e.clientX
				this.y = e.clientY
				this.layout()
				this.$emit('update:show', true)
				e.preventDefault()
			},
			// 布局
			layout() {
				this.style = {
					left: this.x + 'px',
					top: this.y + 'px'
				}
			}
		}
	}
</script>
