import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages のサブパス（/pisa3d-showcase/）でも動くよう相対パスで出力する
  base: './',
  plugins: [vue()],
})
