import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // Add this 'server' block to enable network access
  server: {
    host: '0.0.0.0', // This makes it accessible from your network
    port: 5173,      // Vite's default port. Change if you use a different one.
    // If you run into issues with HMR (Hot Module Replacement)
    // not working over the network, you might need to specify client options:
    // hmr: {
    //   clientPort: 5173, // Use the same port as your server
    // },
    // Optionally, if you want to explicitly allow all hosts (useful in some environments):
    // strictPort: true, // Fail if port is already in use
  }
})