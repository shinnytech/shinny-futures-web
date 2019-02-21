module.exports = {
	root: true,
	env: {
		"browser": true,
		"node": true
	},
	'extends': [
		// 'standard',
		'plugin:vue/essential',
		'eslint:recommended'
	],
	rules: {
		"vue/no-use-v-if-with-v-for": 0,
		"vue/no-parsing-error": [2, {"x-invalid-end-tag": false}],
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-trailing-spaces': 'warn',
		'no-mixed-spaces-and-tabs': ["error", "smart-tabs"],
		'no-empty': 'off',
		'no-unused-vars': 'off'
	},
	parserOptions: {
		parser: 'babel-eslint'
	}
}
