import { useAuthStore } from "~/features/auth/states/authStore";

/**
 * Guard global:
 * - belum login membuka halaman selain /auth/* -> ke /auth/login
 * - sudah login membuka /auth/* -> ke /
 */
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const isAuthPage = to.path.startsWith("/auth/");

  if (!auth.isAuthenticated && !isAuthPage) return navigateTo("/auth/login");
  if (auth.isAuthenticated && isAuthPage) return navigateTo("/");
  return undefined;
});