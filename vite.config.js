import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 5 MB
      },
      manifest: {
        name: "ColumbiaEcomLite",
        short_name: "EcomApp",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: "columbialogo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "columbialogo512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "csc_logo.webp",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
