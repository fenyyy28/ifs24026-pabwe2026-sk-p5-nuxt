import type { RouterConfig } from "@nuxt/schema";
import { routes } from "~/routes";

// Menggantikan rute otomatis Nuxt dengan deklarasi di src/routes.ts
export default {
  routes: () => routes,
} satisfies RouterConfig;