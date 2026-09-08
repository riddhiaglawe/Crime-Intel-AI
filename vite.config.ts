import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import './server/env.js';
import {defineConfig, type Plugin} from 'vite';
import {createApiApp} from './server/api.js';

// Mounts the MongoDB Atlas state API on the vite dev server so `npm run dev`
// keeps working as a single command.
function mongoApiPlugin(): Plugin {
  return {
    name: 'crimeintel-mongo-api',
    configureServer(server) {
      server.middlewares.use('/api', createApiApp());
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api', createApiApp());
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), mongoApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
