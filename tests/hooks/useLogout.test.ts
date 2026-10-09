import { beforeEach, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useCashFlowsStore } from "~/features/cashflows/states/cashFlowsStore";
import { useUsersStore } from "~/features/users/states/usersStore";
import { getAccessToken, putAccessToken } from "~/helpers/apiHelper";
import { useLogout } from "~/hooks/useLogout";
import { inflow } from "../support/fixtures";

const push = vi.hoisted(() => vi.fn());
vi.mock("vue-router", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => {
  localStorage.clear();
  push.mockReset();
  setActivePinia(createPinia());
});

it("menghapus token, membersihkan store, lalu ke halaman login", async () => {
  putAccessToken("tok");
  setActivePinia(createPinia());
  useUsersStore().profile = { id: 1, name: "Feny", email: "f@x.id" };
  useCashFlowsStore().cashFlows = [inflow];

  await useLogout()();

  expect(getAccessToken()).toBeNull();
  expect(useUsersStore().profile).toBeNull();
  expect(useCashFlowsStore().cashFlows).toEqual([]);
  expect(push).toHaveBeenCalledWith("/auth/login");
});