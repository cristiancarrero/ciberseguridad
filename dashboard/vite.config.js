import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@aws-sdk/client-ec2', '@aws-sdk/client-cloudwatch'],
    include: [
      '@aws-sdk/client-s3',
      '@aws-sdk/client-ec2',
      '@aws-sdk/client-cloudwatch',
      '@aws-sdk/client-sts'
    ],
    force: false,
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis',
      }
    }
  },
  define: {
    'process.env': {}
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
    },
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'fast-xml-parser': 'fast-xml-parser/src/fxp.js',
      './runtimeConfig': './runtimeConfig.browser',
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
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
