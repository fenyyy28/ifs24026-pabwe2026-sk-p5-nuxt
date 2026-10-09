import { useRouter } from "vue-router";
import { useAuthStore } from "~/features/auth/states/authStore";
import { useCashFlowsStore } from "~/features/cashflows/states/cashFlowsStore";
import { useUsersStore } from "~/features/users/states/usersStore";

/** Mengembalikan fungsi logout: hapus token, bersihkan semua store, lalu ke halaman login. */
export function useLogout() {
  const router = useRouter();
  const auth = useAuthStore();
  const users = useUsersStore();
  const cashFlows = useCashFlowsStore();

  return async (): Promise<void> => {
    auth.logout();
    users.clear();
    cashFlows.$reset();
    await router.push("/auth/login");
  };
}