import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import antdvStyleLabel from 'vite-plugin-antdv-style'

// https://vite.dev/config/
export default defineConfig({
  plugins: [antdvStyleLabel(), vue()],
  optimizeDeps: { entries: ['index.html'] },
  resolve: { dedupe: ['vue', 'antdv-next', '@antdv-next/cssinjs'] },
  ssr: { noExternal: ['antdv-style', 'antdv-next', /^@v-c\//, '@antdv-next/cssinjs'] },
})
