import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: false,
  build: {
    outDir: 'dist',
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        passes: 2,
      },
    },
    rollupOptions: {
      input: 'index.html',
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    reportCompressedSize: true,
  },
  server: {
    port: 5173,
    open: false,
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});