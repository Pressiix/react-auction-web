import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  publicDir: "src/assets",
  server: {
    host: "0.0.0.0", // Allows access from external networks
    port: 5173, // Default Vite port
  },
});