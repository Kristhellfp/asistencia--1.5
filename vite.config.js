import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/asistencia1.5/", 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
