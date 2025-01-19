import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@aws-sdk/client-ec2', '@aws-sdk/client-cloudwatch'],
    include: ['fast-xml-parser'],
    force: false,
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
      clientPort: 3000,
      timeout: 120000,
      overlay: true
    },
    proxy: {
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      'fast-xml-parser': 'fast-xml-parser/src/fxp.js'
    }
  },
  build: {
    commonjsOptions: {
      include: [/fast-xml-parser/, /node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          aws: ['@aws-sdk/client-ec2', '@aws-sdk/client-cloudwatch']
        }
      }
    },
    target: 'esnext',
    minify: false,
    sourcemap: true,
    cache: true
  },
  cacheDir: 'node_modules/.vite/cache'
})
