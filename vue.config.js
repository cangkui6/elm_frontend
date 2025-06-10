const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: true,

  // 开发服务器配置
  devServer: {
    host: 'localhost', // 服务器主机名
    port: 8081, // 开发服务器端口
    https: false, // 是否启用 HTTPS
    open: true, // 是否在启动时打开浏览器
    proxy: {
      '/': {
        target: 'http://localhost:9000',
        ws: false, // 禁用 WebSocket 代理
        changeOrigin: true
      }
    }
  },
  
  // 配置webpack
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
      })
    ]
  }
})
