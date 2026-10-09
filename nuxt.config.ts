import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const APP_PORT = Number(process.env.APP_PORT) || 3000;
const DELCOM_BASEURL = process.env.VITE_DELCOM_BASEURL ?? "";

const featurePage = (path: string) =>
  fileURLToPath(new URL(`./src/features/${path}`, import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  srcDir: "src/",
  devtools: { enabled: false },
  modules: ["@pinia/nuxt"],
  css: ["~/index.css"],

  devServer: { port: APP_PORT },

  pages: true,
  hooks: {
    "pages:extend"(pages) {
      pages.push(
        { name: "login", path: "/auth/login", file: featurePage("auth/pages/LoginPage.vue") },
        { name: "register", path: "/auth/register", file: featurePage("auth/pages/RegisterPage.vue") },
        {
          // Shell dashboard terproteksi; halaman anak tampil di <NuxtPage />
          path: "/",
          file: featurePage("cashflows/layouts/CashFlowLayout.vue"),
          children: [
            { name: "home", path: "", file: featurePage("cashflows/pages/HomePage.vue") },
            {
              name: "cash-flow-detail",
              path: "cash-flows/:cashFlowId",
              file: featurePage("cashflows/pages/DetailPage.vue"),
            },
            { name: "users", path: "users", file: featurePage("users/pages/UsersPage.vue") },
            { name: "profile", path: "profile", file: featurePage("users/pages/ProfilePage.vue") },
          ],
        },
        {
          name: "not-found",
          path: "/:pathMatch(.*)*",
          file: featurePage("common/pages/NotFoundPage.vue"),
        },
      );
    },
  },

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