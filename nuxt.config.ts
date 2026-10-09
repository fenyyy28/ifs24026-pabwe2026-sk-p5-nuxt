import tailwindcss from "@tailwindcss/vite";

const APP_PORT = Number(process.env.APP_PORT) || 3000;
const DELCOM_BASEURL = process.env.VITE_DELCOM_BASEURL ?? "";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  srcDir: "src/",
  devtools: { enabled: false },
  modules: ["@pinia/nuxt"],
  css: ["~/index.css"],

  devServer: { port: APP_PORT },

  app: {
    head: {
      title: "Delcom Cash Flow",
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
        },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    define: {
      DELCOM_BASEURL: JSON.stringify(DELCOM_BASEURL),
    },
  },
});