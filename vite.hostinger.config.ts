import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { assistantLocalPlugin } from './server/assistant-local-plugin';

export default defineConfig({
  plugins: [react(), tailwindcss(), tsConfigPaths(), assistantLocalPlugin()],
  // Acervo e índices locais nunca podem ser servidos, nem via /@fs/ ou ?raw.
  server: {
    // API de compras isolada; não compartilha middleware nem dados com o F4.
    proxy: { '/api/loja': 'http://127.0.0.1:8788' },
    fs: {
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.codex/**', '**/.hostinger/**', '**/*.{zip,log}', '**/.private-assistant/**', '**/.private-assistant-node/**', '**/.private-commerce/**', '**/.server-build/**', '**/server/**', '**/scripts/**', '**/tests/**'],
    },
  },
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
