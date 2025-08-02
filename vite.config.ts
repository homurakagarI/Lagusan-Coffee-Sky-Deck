import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  // Image optimization settings
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.avif'],
  
  build: {
    // Enable asset inlining for small images
    assetsInlineLimit: 4096,
    
    rollupOptions: {
      output: {
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && /\.(jpg|jpeg|png|webp|avif)$/i.test(assetInfo.name)) {
            return 'images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 5174,
    host: '0.0.0.0', // Allow connections from any host
    strictPort: true,
    open: false,
    cors: true,
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Permissions-Policy': 'unload=()'
    },
    // Enhanced WebSocket configuration for Windows compatibility
    hmr: {
      port: 5175, // Try a different port for WebSocket
      host: 'localhost',
      protocol: 'ws',
      clientPort: 5175,
      timeout: 30000,
      overlay: false
    },
    // Additional server options for better connection stability
    watch: {
      usePolling: false,
      interval: 100,
      // Ignore node_modules to improve performance
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    // Middleware configuration
    middlewareMode: false
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', '@vue/runtime-core']
  }
})
