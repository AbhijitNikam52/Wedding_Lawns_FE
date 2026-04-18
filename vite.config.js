import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target:      "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir:        "dist",
    sourcemap:     false,      // disable in production for smaller bundle
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          vendor:   ["react", "react-dom", "react-router-dom"],
          charts:   ["recharts"],
          socket:   ["socket.io-client"],
          calendar: ["react-calendar"],
        },
      },
    },
  },
});