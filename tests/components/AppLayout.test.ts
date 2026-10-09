import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import AppLayout from "~/components/AppLayout.vue";
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
const profile: User = { id: 1, name: "Feny Pasaribu", email: "f@x.id", photo: null, bio: null };

function factory(initial: User | null) {
  const pinia = createPinia();
  setActivePinia(pinia);
  useUsersStore().profile = initial;
  return mount(AppLayout, {
    global: { plugins: [pinia], components: { NuxtLink: { template: "<a><slot /></a>" } } },
    slots: { default: "<p>konten</p>" },
  });
}

beforeEach(() => {
  localStorage.clear();
  push.mockReset();
  getMe.mockReset();
  errorDialog.mockReset();
});

describe("AppLayout", () => {
  it("menampilkan profil dan slot tanpa memuat ulang", () => {
    const wrapper = factory(profile);
    expect(wrapper.text()).toContain("Feny Pasaribu");
    expect(wrapper.text()).toContain("konten");
    expect(getMe).not.toHaveBeenCalled();
  });

  it("memuat profil bila belum ada", async () => {
    getMe.mockResolvedValue(profile);
    const wrapper = factory(null);
    expect(wrapper.text()).not.toContain("Feny Pasaribu");
    await flushPromises();
    expect(wrapper.text()).toContain("Feny Pasaribu");
  });

  it("logout otomatis saat token ditolak (401)", async () => {
    putAccessToken("tok");
    getMe.mockRejectedValue(new ApiError("Unauthenticated.", 401));
    factory(null);
    await flushPromises();
    expect(push).toHaveBeenCalledWith("/auth/login");
    expect(getAccessToken()).toBeNull();
    expect(errorDialog).not.toHaveBeenCalled();
  });

  it("menampilkan dialog untuk error lain tanpa logout", async () => {
    getMe.mockRejectedValue(new ApiError("Server error", 500));
    factory(null);
    await flushPromises();
    expect(errorDialog).toHaveBeenCalledWith("Server error");
    expect(push).not.toHaveBeenCalled();
  });

  it("tombol keluar menghapus sesi lalu ke halaman login", async () => {
    putAccessToken("tok");
    const wrapper = factory(profile);
    await wrapper.get("#logout-button").trigger("click");
    await flushPromises();
    expect(push).toHaveBeenCalledWith("/auth/login");
    expect(getAccessToken()).toBeNull();
    expect(useUsersStore().profile).toBeNull();
  });
});