import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "inoui.localhost",
    port: 3000,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        // SSE (text/event-stream) must not be buffered by the proxy.
        // The configure callback is supported in http-proxy-middleware v2+
        // (bundled with Vite 2.8+). If this causes issues, remove the
        // configure block — SSE may still work since the server sets
        // Content-Type: text/event-stream directly.
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            if (proxyRes.headers["content-type"] === "text/event-stream") {
              proxyRes.headers["connection"] = "keep-alive";
            }
          });
        },
      },
    },
  },
});
