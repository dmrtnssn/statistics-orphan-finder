import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/statistics-orphan-panel.ts'),
      formats: ['es'],
      fileName: () => 'statistics-orphan-panel.js'
    },
    outDir: 'www',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true
      }
    },
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
