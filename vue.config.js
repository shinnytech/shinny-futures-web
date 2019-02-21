let baseUrl = process.env.NODE_ENV === 'production' ? 'shinny-futures-web/' : '/'

module.exports = {
	baseUrl,
	outputDir: 'dist',
	assetsDir: 'assets', // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
	indexPath: 'index.html', // 指定生成的 index.html 的输出路径 (相对于 outputDir)。也可以是一个绝对路径。

	productionSourceMap: false, // 不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。

	css: {
		loaderOptions: {
			css: {
				// 这里的选项会传递给 css-loader
			},
			postcss: {
				// 这里的选项会传递给 postcss-loader
			},
			// 给 sass-loader 传递选项
			sass: {
				// @/ 是 src/ 的别名
				// 所以这里假设你有 `src/variables.scss` 这个文件
				data: `@import "@/variables.scss";`
			}
		}
	},

	// 调整 Webpack 配置 https://webpack.js.org/configuration/dev-server/
	configureWebpack: {
		plugins: [
			// new MyAwesomeWebpackPlugin()
		]
	},
	chainWebpack: config => {
		config.module
			.rule('eslint')
			.use('eslint-loader')
			.loader('eslint-loader')
			.tap(options => {
				// 修改它的选项...
				options.fix = true
				return options
			})
	},

	// 设置让浏览器
	devServer: {
		// host: '0.0.0.0'
	}
}
