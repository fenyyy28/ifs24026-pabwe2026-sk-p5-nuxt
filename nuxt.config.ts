import tailwindcss from "@tailwindcss/vite";

const APP_PORT = Number(process.env.APP_PORT) || 3000;
const DELCOM_BASEURL =
  process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  srcDir: "src/",
  devtools: { enabled: false },
  modules: ["@pinia/nuxt"],
  css: ["~/index.css"],

  devServer: { port: APP_PORT },

  // Mengaktifkan <NuxtPage />; daftar rute ada di src/routes.ts via src/router.options.ts
  pages: true,

  // Tampilan awal instan sebelum JavaScript selesai dimuat (SPA)
  spaLoadingTemplate: "spa-loading-template.html",

  app: {
    head: {
      htmlAttrs: { lang: "id" },
      title: "Delcom Cash Flow",
      meta: [
        {
          name: "description",
          content:
            "Catat pemasukan dan pengeluaran, lalu pantau saldo kas, tabungan, dan pinjaman Anda dengan Delcom Cash Flow.",
        },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        // Dimuat tanpa memblokir render pertama
        { rel: "stylesheet", href: FONT_URL, media: "print", onload: "this.media='all'" },
      ],
      noscript: [{ innerHTML: `<link rel="stylesheet" href="${FONT_URL}">` }],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    define: {
      DELCOM_BASEURL: JSON.stringify(DELCOM_BASEURL),
    },
  },
});