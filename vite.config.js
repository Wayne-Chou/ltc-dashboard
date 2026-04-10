import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  return {
    base: mode === "dashboard" ? "/dashboard/" : "/ltc-dashboard/",
    build: {
      outDir: mode === "dashboard" ? "dist-dashboard" : "dist-ltc",
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          login: resolve(__dirname, "login.html"),
          personDetail: resolve(__dirname, "personDetail.html"),
        },
        output: {
          entryFileNames: `assets/js/[name].js`,
          chunkFileNames: `assets/js/[name].js`,
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split(".");
            const ext = info[info.length - 1];

            if (/\.(png|jpe?g|gif|svg|webp)$/i.test(assetInfo.name)) {
              return `assets/img/[name].[ext]`;
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
  };
});
