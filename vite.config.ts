
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: process.env.HOST || "0.0.0.0",   // aceita IPv4/IPv6 e LAN
    port: Number(process.env.PORT) || 8080  // define porta via env ou default 8080
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',               // usa JSDOM para testes de DOM
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
}));
