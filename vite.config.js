import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    vueDevTools(),
    AutoImport({
      imports: [
        'vue',
        {
          'element-plus': ['ElLoading'],
        },
      ],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
   server: {
    port: 5175,// 本地开发服务器端口号
    proxy: {
      '/api': {
        target: 'http://localhost:8000',// 目标后端服务器地址
        changeOrigin: true,// 修改请求头中的 origin 为目标地址
        rewrite: (p) => p.replace(/^\/api/, '')
      }
    }
  }
//   启动本地开发服务器，端口为 5175。
// 当前端请求 /api/xxx 时，会自动转发到 http://localhost:8000/xxx，解决跨域问题。
// rewrite 用于去掉 /api 前缀，使后端能正确识别接口路径。
 
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `@use "@/assets/styles/element-plus-custom.scss" as *;`,
  //     },
  //   },
  // },
})
