import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/ltc-dashboard-dev/",
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        personDetail: resolve(__dirname, "personDetail.html"),
      },
      // --- 加入以下輸出設定 ---
      output: {
        // 讓 JS 檔案放在 assets/js/ 資料夾下，且不使用亂碼
        entryFileNames: `assets/js/[name].js`,
        chunkFileNames: `assets/js/[name].js`,
        // 讓 CSS 和圖片等資源分類存放
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const extType = info[info.length - 1];
          if (
            /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)
          ) {
            return `assets/media/[name].[ext]`;
          }
          if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/img/[name].[ext]`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/fonts/[name].[ext]`;
          }
          if (/\.css$/i.test(assetInfo.name)) {
            return `assets/css/[name].[ext]`;
          }
          return `assets/[name].[ext]`;
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  publicDir: "public",
});
