import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // UI / icons
          if (id.includes("lucide-react") || id.includes("lucide")) return "icons";
          if (id.includes("react-icons")) return "react-icons";

          // Core Routing
          if (id.includes("react-router-dom") || id.includes("react-router")) return "router";

          // Core React
          if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/")) return "react";

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
