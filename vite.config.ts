import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Assuming "src" directory is in the root
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: __dirname, // Set the root to the current directory
  build: {
    outDir: path.resolve(__dirname, "dist"), // Output directory in the root
    emptyOutDir: true,
  },
});
