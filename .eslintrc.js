module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    // 'standard',
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  rules: {
    "vue/no-parsing-error": [2, { "x-invalid-end-tag": false }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
