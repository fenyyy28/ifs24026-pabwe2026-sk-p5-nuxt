import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import NavbarComponent from "~/features/cashflows/components/NavbarComponent.vue";
import SidebarComponent from "~/features/cashflows/components/SidebarComponent.vue";
import CashFlowLayout from "~/features/cashflows/layouts/CashFlowLayout.vue";
import * as userApi from "~/features/users/api/userApi";
import type { User } from "~/features/users/api/userApi";
import { useUsersStore } from "~/features/users/states/usersStore";
import { ApiError, getAccessToken, putAccessToken } from "~/helpers/apiHelper";
import { showErrorDialog } from "~/helpers/toolsHelper";

const push = vi.hoisted(() => vi.fn());
vi.mock("vue-router", () => ({ useRouter: () => ({ push }) }));
vi.mock("~/helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));
vi.mock("~/features/users/api/userApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  updateMe: vi.fn(),
  uploadPhoto: vi.fn(),
  changePassword: vi.fn(),
}));

const getMe = userApi.getMe as unknown as ReturnType<typeof vi.fn>;
const errorDialog = showErrorDialog as unknown as ReturnType<typeof vi.fn>;
const profile: User = { id: 1, name: "Feny Pasaribu", email: "feny@x.id", photo: null };

const globalOptions = (pinia: ReturnType<typeof createPinia>) => ({
  plugins: [pinia],
  components: {
    NuxtLink: { template: "<a><slot /></a>" },
    NuxtPage: { template: "<div id=\"page\">halaman</div>" },
  },
});

function setup(initial: User | null) {
  const pinia = createPinia();
  setActivePinia(pinia);
  useUsersStore().profile = initial;
  return pinia;
}

beforeEach(() => {
  localStorage.clear();
  push.mockReset();
  getMe.mockReset();
  errorDialog.mockReset();
});

describe("SidebarComponent", () => {
  it("menampilkan tiga menu", () => {
    const wrapper = mount(SidebarComponent, {
      global: { components: { NuxtLink: { template: "<a><slot /></a>" } } },
    });
    expect(wrapper.text()).toContain("Ringkasan Arus Kas");
    expect(wrapper.text()).toContain("Direktori Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });
});

describe("NavbarComponent", () => {
  it("menampilkan nama, email, dan sesi aktif saat ada token", () => {
    putAccessToken("tok");
    const pinia = setup(profile);
    const wrapper = mount(NavbarComponent, { global: globalOptions(pinia) });
    expect(wrapper.text()).toContain("Feny Pasaribu");
    expect(wrapper.text()).toContain("feny@x.id");
    expect(wrapper.get("#session-status").text()).toContain("Sesi aktif");
  });

  it("menampilkan sesi tidak aktif tanpa token dan tanpa profil", () => {
    const pinia = setup(null);
    const wrapper = mount(NavbarComponent, { global: globalOptions(pinia) });
    expect(wrapper.get("#session-status").text()).toContain("Sesi tidak aktif");
    expect(wrapper.text()).not.toContain("Feny");
  });

  it("tombol keluar menghapus sesi lalu ke login", async () => {
    putAccessToken("tok");
    const pinia = setup(profile);
    const wrapper = mount(NavbarComponent, { global: globalOptions(pinia) });
    await wrapper.get("#logout-button").trigger("click");
    await flushPromises();
    expect(getAccessToken()).toBeNull();
    expect(push).toHaveBeenCalledWith("/auth/login");
  });
});

describe("CashFlowLayout", () => {
  it("menampilkan navbar, sidebar, dan halaman tanpa memuat ulang profil", () => {
    const pinia = setup(profile);
    const wrapper = mount(CashFlowLayout, { global: globalOptions(pinia) });
    expect(wrapper.text()).toContain("Feny Pasaribu");
    expect(wrapper.text()).toContain("Profil Saya");
    expect(wrapper.find("#page").exists()).toBe(true);
    expect(getMe).not.toHaveBeenCalled();
  });

  it("memuat profil bila belum ada", async () => {
    getMe.mockResolvedValue(profile);
    const pinia = setup(null);
    const wrapper = mount(CashFlowLayout, { global: globalOptions(pinia) });
    await flushPromises();
    expect(wrapper.text()).toContain("Feny Pasaribu");
  });

  it("logout otomatis saat token ditolak (401)", async () => {
    putAccessToken("tok");
    getMe.mockRejectedValue(new ApiError("Unauthenticated.", 401));
    const pinia = setup(null);
    mount(CashFlowLayout, { global: globalOptions(pinia) });
    await flushPromises();
    expect(push).toHaveBeenCalledWith("/auth/login");
    expect(getAccessToken()).toBeNull();
    expect(errorDialog).not.toHaveBeenCalled();
  });

  it("menampilkan dialog untuk error lain tanpa logout", async () => {
    getMe.mockRejectedValue(new ApiError("Server error", 500));
    const pinia = setup(null);
    mount(CashFlowLayout, { global: globalOptions(pinia) });
    await flushPromises();
    expect(errorDialog).toHaveBeenCalledWith("Server error");
    expect(push).not.toHaveBeenCalled();
  });
});