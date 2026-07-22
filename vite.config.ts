import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import {defineConfig, Plugin} from 'vite';

function downloadZipPlugin(): Plugin {
  return {
    name: 'download-zip-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/download-zip') {
          try {
            const zip = new AdmZip();
            const rootDir = process.cwd();
            const files = fs.readdirSync(rootDir);
            
            // Files/dirs to ignore
            const ignoreList = [
              'node_modules',
              'dist',
              '.git',
              'cloned_repo',
              'cloned_repo_old',
              'github_repo',
              '.cache',
              '.npm'
            ];

            for (const file of files) {
              if (ignoreList.includes(file)) continue;
              const fullPath = path.join(rootDir, file);
              const stat = fs.statSync(fullPath);
              if (stat.isDirectory()) {
                zip.addLocalFolder(fullPath, file);
              } else {
                zip.addLocalFile(fullPath);
              }
            }

            const buffer = zip.toBuffer();
            res.writeHead(200, {
              'Content-Type': 'application/zip',
              'Content-Disposition': 'attachment; filename=lokesh-portfolio.zip',
              'Content-Length': buffer.length,
            });
            res.end(buffer);
          } catch (err) {
            console.error('Error generating zip:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Failed to generate ZIP archive: ' + (err as Error).message);
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), downloadZipPlugin()],
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
