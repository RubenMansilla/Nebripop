import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // Core
          if (id.includes("react-dom") || id.includes("react")) return "react";
          if (id.includes("react-router-dom")) return "router";

          // UI / icons
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("react-icons")) return "react-icons";

          // Data / realtime
          if (id.includes("@supabase/supabase-js")) return "supabase";
          if (id.includes("socket.io-client")) return "socket";

          // Heavy features
          if (id.includes("recharts")) return "charts";
          if (id.includes("jspdf")) return "pdf";
          if (id.includes("browser-image-compression")) return "image-tools";

          // Misc
          if (id.includes("axios")) return "http";

          return "vendor";
        },
      },
    },
  },
});
