import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: '.'
        },
        {
          src: 'icons',
          dest: '.'
        },
        {
          src: 'src/content/selector.css',
          dest: 'src/content'
        },
        {
          src: 'src/content/selector.js',
          dest: 'src/content'
        },
        {
          src: 'src/background.js',
          dest: 'src'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html')
      },
      external: ['chrome'],
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.facadeModuleId?.includes('popup')) {
            return 'src/popup/popup.js';
          }
          return 'src/[name].js';
        },
        chunkFileNames: 'src/chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            if (assetInfo.name.includes('popup')) {
              return 'src/popup/popup.css';
            }
            if (assetInfo.name.includes('selector')) {
              return 'src/content/selector.css';
            }
          }
          return 'src/assets/[name]-[hash].[ext]';
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
