import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api/momence': {
          target: 'https://api.momence.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/momence/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add the required headers for Momence API
              if (env.VITE_MOMENCE_ALL_COOKIES) {
                proxyReq.setHeader('Cookie', env.VITE_MOMENCE_ALL_COOKIES);
              }
              proxyReq.setHeader('Accept', 'application/json');
              proxyReq.setHeader('X-App', 'dashboard-be30c5883a626f6fa3c6b7ccefdf1fe89608a668');
              proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36');
              
              // Add a unique idempotence key for each request
              proxyReq.setHeader('X-Idempotence-Key', Date.now() + '-' + Math.random().toString(36).substr(2, 9));
            });
          }
        }
      }
    }
  }
})