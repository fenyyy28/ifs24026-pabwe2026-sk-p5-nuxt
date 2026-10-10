import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import type { RouteRecordRaw } from "vue-router";
import CashFlowLayout from "~/features/cashflows/layouts/CashFlowLayout.vue";
import * as userApi from "~/features/users/api/userApi";
import type { User } from "~/features/users/api/userApi";
import { ApiError, getAccessToken, putAccessToken } from "~/helpers/apiHelper";
import { showErrorDialog } from "~/helpers/toolsHelper";
import { renderWithProviders } from "~/test-utils";

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

const routes: RouteRecordRaw[] = [
  { path: "/", component: { template: '<div id="page">isi halaman</div>' } },
  { path: "/:pathMatch(.*)*", component: { render: () => null } },
];

beforeEach(() => {
  getMe.mockReset();
  errorDialog.mockReset();
});

describe("CashFlowLayout", () => {
  it("menampilkan navbar, sidebar, dan halaman aktif tanpa memuat ulang profil", async () => {
    const { wrapper } = await renderWithProviders(CashFlowLayout, {
      routes,
      initialState: { users: { profile } },
    });
    expect(document.querySelector("#page")).toHaveTextContent("isi halaman");
    expect(wrapper.text()).toContain("Feny Pasaribu");
    expect(wrapper.text()).toContain("Direktori Pengguna");
    expect(getMe).not.toHaveBeenCalled();
  });

  it("memuat profil bila belum ada", async () => {
    getMe.mockResolvedValue(profile);
    const { wrapper } = await renderWithProviders(CashFlowLayout, { routes });
    await flushPromises();
    expect(getMe).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("Feny Pasaribu");
  });

  it("logout otomatis saat token ditolak (401)", async () => {
    putAccessToken("tok");
    getMe.mockRejectedValue(new ApiError("Unauthenticated.", 401));
    const { router } = await renderWithProviders(CashFlowLayout, { routes });
    await flushPromises();

    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(getAccessToken()).toBeNull();
    expect(errorDialog).not.toHaveBeenCalled();
  });

  it("menampilkan dialog untuk error lain tanpa logout", async () => {
    getMe.mockRejectedValue(new ApiError("Server error", 500));
    const { router } = await renderWithProviders(CashFlowLayout, { routes });
    await flushPromises();

    expect(errorDialog).toHaveBeenCalledWith("Server error");
    expect(router.currentRoute.value.path).toBe("/");
  });
});