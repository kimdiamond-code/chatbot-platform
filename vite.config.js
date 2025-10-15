import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api/consolidated': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/consolidated/, '/api'),
        configure: (proxy, options) => {
          // Wait for API to be ready
          const waitForAPI = async () => {
            try {
              const response = await fetch('http://localhost:3000/api');
              if (response.ok) {
                console.log('✅ API server is ready');
                return true;
              }
            } catch (err) {
              console.log('⏳ Waiting for API server...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              return waitForAPI();
            }
          };
          
          waitForAPI().catch(console.error);
          
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            // Return a more detailed error for debugging
            res.writeHead(503, {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            });
            res.end(JSON.stringify({ 
              error: 'API service unavailable',
              status: 'offline',
              details: err.message,
              code: err.code,
              demoMode: true,
              retryAfter: 5
            }));
          });
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    // Define globals if needed
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})
