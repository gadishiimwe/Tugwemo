// vite.config.js
import { defineConfig } from "file:///D:/Tugwemo/client/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true
      },
      "/admin": {
        target: "http://localhost:8000",
        changeOrigin: true
      },
      "/assets": {
        target: "http://localhost:8000",
        changeOrigin: true
      },
      "/socket.io": {
        target: "http://localhost:8000",
        changeOrigin: true,
        ws: true
      }
    },
    configureServer(server) {
      server.middlewares.use("/admin", (req, res, next) => {
        next();
      });
      server.middlewares.use("/assets", (req, res, next) => {
        next();
      });
    }
  },
  build: {
    outDir: "dist"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxUdWd3ZW1vXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcVHVnd2Vtb1xcXFxjbGllbnRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1R1Z3dlbW8vY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTczLFxyXG4gICAgaG9zdDogdHJ1ZSxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlXHJcbiAgICAgIH0sXHJcbiAgICAgICcvYWRtaW4nOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcclxuICAgICAgfSxcclxuICAgICAgJy9hc3NldHMnOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcclxuICAgICAgfSxcclxuICAgICAgJy9zb2NrZXQuaW8nOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgd3M6IHRydWVcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcclxuICAgICAgLy8gSGFuZGxlIGFkbWluIHJvdXRlcyBieSBub3Qgc2VydmluZyBpbmRleC5odG1sIGZvciB0aGVtXHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hZG1pbicsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgICAgIC8vIExldCB0aGUgcHJveHkgaGFuZGxlIGFkbWluIHJvdXRlc1xyXG4gICAgICAgIG5leHQoKTtcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIEhhbmRsZSBhc3NldHMgZm9yIGFkbWluXHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hc3NldHMnLCAocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICAvLyBMZXQgdGhlIHByb3h5IGhhbmRsZSBhc3NldHNcclxuICAgICAgICBuZXh0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnXHJcbiAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJPLFNBQVMsb0JBQW9CO0FBRXhRLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsTUFDQSxXQUFXO0FBQUEsUUFDVCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxNQUNBLGNBQWM7QUFBQSxRQUNaLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLElBQUk7QUFBQSxNQUNOO0FBQUEsSUFDRjtBQUFBLElBQ0EsZ0JBQWdCLFFBQVE7QUFFdEIsYUFBTyxZQUFZLElBQUksVUFBVSxDQUFDLEtBQUssS0FBSyxTQUFTO0FBRW5ELGFBQUs7QUFBQSxNQUNQLENBQUM7QUFFRCxhQUFPLFlBQVksSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLFNBQVM7QUFFcEQsYUFBSztBQUFBLE1BQ1AsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsRUFDVjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
