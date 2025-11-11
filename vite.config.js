import { defineConfig } from 'vite';

export default defineConfig({
  base: '/vibe-phaserjs-game/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
  },
});
