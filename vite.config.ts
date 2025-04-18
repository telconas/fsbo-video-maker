import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // updated from "client/src"
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: ".", // now pointing to the project root
  build: {
    outDir: "dist", // build to ./dist (Netlify expects this)
    emptyOutDir: true,
  },
});
