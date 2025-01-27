import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@aws-sdk': path.resolve(__dirname, 'node_modules/@aws-sdk'),
      './runtimeConfig': './runtimeConfig.browser'
    }
  },
  define: {
    global: 'window',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    },
    include: [
      '@aws-sdk/client-s3',
      '@aws-sdk/client-cloudwatch',
      '@aws-sdk/util-endpoints'
    ]
  },
  server: {
    fs: {
      strict: false,
      allow: ['..', '.', 'node_modules']
    }
  }
}); 