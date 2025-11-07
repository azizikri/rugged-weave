import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const tailwindPlugin = tailwindcss() as unknown as PluginOption;
const routerPlugin = tanstackRouter({}) as PluginOption;
const cloudflarePlugin = cloudflare() as PluginOption;

export default defineConfig({
  plugins: [
    tailwindPlugin,
    routerPlugin,
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "rugged-weave",
        short_name: "rugged-weave",
        description: "rugged-weave - PWA Application",
        theme_color: "#0c0c0c",
      },
      pwaAssets: { disabled: false, config: true },
      devOptions: { enabled: true },
    }),
    cloudflarePlugin,
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
