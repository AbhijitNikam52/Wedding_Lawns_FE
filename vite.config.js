import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to backend during development
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target:       "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir:    "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 600, // raise warning threshold to 600 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/")) {
            return "react-core";
          }
          // Routing
          if (id.includes("node_modules/react-router")) {
            return "router";
          }
          // Charts (recharts is large — isolate it)
          if (id.includes("node_modules/recharts") ||
              id.includes("node_modules/d3-") ||
              id.includes("node_modules/victory-")) {
            return "charts";
          }
          // Socket.io
          if (id.includes("node_modules/socket.io-client") ||
              id.includes("node_modules/engine.io-client")) {
            return "socket";
          }
          // Calendar
          if (id.includes("node_modules/react-calendar")) {
            return "calendar";
          }
          // Everything else in node_modules → vendor
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});