import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // 1. Core React (Group ALL core dependencies to avoid init errors)
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/react-router/") ||
            id.includes("/node_modules/react-router-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // 2. UI & Icons (Heavy but independent)
          if (
            id.includes("/node_modules/lucide-react/") ||
            id.includes("/node_modules/lucide/") ||
            id.includes("/node_modules/react-icons/")
          ) {
            return "vendor-icons";
          }

          // 3. Data & Realtime
          if (
            id.includes("/node_modules/@supabase/") ||
            id.includes("/node_modules/socket.io-client/")
          ) {
            return "vendor-data";
          }

          // 4. Heavy Features
          if (id.includes("/node_modules/recharts/")) return "vendor-charts";
          if (id.includes("/node_modules/jspdf/")) return "vendor-pdf";
          if (id.includes("/node_modules/browser-image-compression/")) return "vendor-image";
          if (id.includes("/node_modules/axios/")) return "vendor-http";

          // Default vendor chunk for everything else
          return "vendor";
        },
      },
    },
  },
});
