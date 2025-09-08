import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: "./",
    build: {
      sourcemap: mode !== "production",
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            three: ["three"]
          }
        }
      }
    },
    server: {
      port: 5173,
      open: true
    }
  };
});