// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Sitemap from "vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: "https://ganada.my",
      dynamicRoutes: ["/", "/home", "/menu", "/promos", "/contact"],
      // (선택) 제외하고 싶은 경로가 있으면:
      // exclude: ["/admin", "/private"],
      // (선택) robots.txt 생성 여부(기본 true):
      // generateRobotsTxt: true,
    }),
  ],
});
