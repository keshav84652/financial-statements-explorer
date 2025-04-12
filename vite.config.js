import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '$components': resolve('./src/components'),
      '$lib': resolve('./src/lib'),
      '$utils': resolve('./src/utils'),
      '$stores': resolve('./src/stores'),
      '$assets': resolve('./src/assets'),
      '$data': resolve('./src/data'),
    }
  }
})