import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";

console.log('Loading Vite configuration...');

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'deployment-logger',
      configureServer(server) {
        console.log('Server starting...');
        server.middlewares.use((req, _res, next) => {
          console.log(`Request: ${req.url}`);
          next();
        });
      },
      buildStart() {
        console.log('Build starting...');
      },
      buildEnd() {
        console.log('Build completed');
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    }
  }
}));