import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function spaStaticRoutesPlugin(): Plugin {
  return {
    name: 'spa-static-routes-fallback',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexHtml = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexHtml)) return;

      // 1. Create 404.html fallback for static hosts
      fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));

      // 2. Pre-create static index.html entrypoints for all core sub-routes
      const subRoutes = [
        'admin',
        'admin/orders',
        'cart',
        'women',
        'men',
        'kids',
        'accessories',
        'category/women',
        'category/men',
        'category/kids',
        'category/accessories',
        'category/all',
      ];

      for (const route of subRoutes) {
        const routeDir = path.join(distDir, route);
        fs.mkdirSync(routeDir, {recursive: true});
        fs.copyFileSync(indexHtml, path.join(routeDir, 'index.html'));
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), spaStaticRoutesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
