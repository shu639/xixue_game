import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      react: path.resolve(__dirname, 'src/shims/react.ts'),
      'react-dom': path.resolve(__dirname, 'src/shims/react.ts'),
    },
  },
  optimizeDeps: {
    include: ['zustand'],
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          zustand: ['zustand'],
        },
      },
    },
  },
  base: './',
});
