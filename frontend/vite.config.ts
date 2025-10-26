import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/statistics-orphan-panel.ts'),
      formats: ['es'],
      fileName: () => 'statistics-orphan-panel.js'
    },
    outDir: '../custom_components/statistics_orphan_finder/www',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      external: [],
      output: {
        // Enable code splitting by removing inlineDynamicImports
        manualChunks: {
          // Separate Lit library into its own chunk for better caching
          'lit-core': ['lit', 'lit/decorators.js', 'lit-element', 'lit-html']
        },
        // Optimize chunk file names
        chunkFileNames: 'chunks/[name]-[hash].js'
      }
    },
    minify: 'terser'
    // Note: Terser options are configured via build.minify
    // For advanced terser config, use esbuild.minifyOptions or a rollup plugin
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  esbuild: {
    // Remove comments during build
    legalComments: 'none'
  }
});
