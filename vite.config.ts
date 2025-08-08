import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: mode !== "production",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["lucide-react"],
          "vendor-3d": [
            "three",
            "@react-three/fiber",
            "@react-three/drei",
            "@babylonjs/core",
            "@babylonjs/gui",
            "babylonjs",
          ],
          "vendor-maps": ["mapbox-gl"],
          "vendor-ml": ["@tensorflow/tfjs"],
          "vendor-charts": ["recharts"],
        },
      },
    },
  },
}));
