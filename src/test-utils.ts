import { mount, type VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import type { Component } from "vue";
import {
  RouterLink,
  RouterView,
  createMemoryHistory,
  createRouter,
  type RouteRecordRaw,
  type Router,
} from "vue-router";
import { useAuthStore, type AuthState } from "~/features/auth/states/authStore";
import {
  useCashFlowsStore,
  type CashFlowsState,
} from "~/features/cashflows/states/cashFlowsStore";
import { useUsersStore, type UsersState } from "~/features/users/states/usersStore";

/** Keadaan awal store yang ingin diatur sebelum komponen di-render. */
export interface MockState {
  auth?: Partial<AuthState>;
  users?: Partial<UsersState>;
  cashFlows?: Partial<CashFlowsState>;
}

export interface RenderOptions {
  props?: Record<string, unknown>;
  slots?: Record<string, string>;
  initialState?: MockState;
  /** Alamat awal pada Memory Router. Default: "/" */
  route?: string;
  /** Daftar rute. Default: satu rute penangkap-semua yang tidak menampilkan apa pun. */
  routes?: RouteRecordRaw[];
}

export interface RenderResult {
  wrapper: VueWrapper;
  pinia: Pinia;
  router: Router;
}

const fallbackRoutes: RouteRecordRaw[] = [
  { path: "/:pathMatch(.*)*", component: { render: () => null } },
];

/** Membuat Pinia baru, menjadikannya aktif, lalu mengisi store sesuai keadaan awal. */
export function createMockPinia(initialState: MockState = {}): Pinia {
  const pinia = createPinia();
  setActivePinia(pinia);
  if (initialState.auth) useAuthStore(pinia).$patch(initialState.auth);
  if (initialState.users) useUsersStore(pinia).$patch(initialState.users);
  if (initialState.cashFlows) useCashFlowsStore(pinia).$patch(initialState.cashFlows);
  return pinia;
}

/** Me-render komponen dengan Pinia dan Memory Router sungguhan. */
export async function renderWithProviders(
  component: Component,
  options: RenderOptions = {},
): Promise<RenderResult> {
  const { props, slots, initialState, route = "/", routes = fallbackRoutes } = options;

  const pinia = createMockPinia(initialState);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(route);
  await router.isReady();

  // Tipe generik mount() terlalu ketat untuk komponen sembarang; hasilnya tetap VueWrapper.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrapper = mount(component as any, {
    props,
    slots,
    attachTo: document.body,
    global: {
      plugins: [pinia, router],
      components: { NuxtLink: RouterLink, NuxtPage: RouterView },
    },
  } as any) as unknown as VueWrapper;

  return { wrapper, pinia, router };
}