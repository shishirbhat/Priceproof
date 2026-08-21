import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    // Bind every interface, not just the loopback. Inside WSL2, a VM, a
    // devcontainer or Docker, a server bound only to 127.0.0.1 is
    // unreachable from the host browser — which looks exactly like the
    // server failing to start.
    host: true,
    port: 5173,
    // Move to the next free port rather than exiting when 5173 is taken.
    strictPort: false,
    proxy: {
      // The dashboard's data API. Without the backend running these calls
      // fail and the dashboard renders empty — the front end itself is
      // fine, and /welcome does not depend on it.
      "/api": "http://localhost:3001",
    },
  },
});
