import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "~/app.vue";
import * as cashFlowApi from "~/features/cashflows/api/cashFlowApi";
import * as userApi from "~/features/users/api/userApi";
import { routes } from "~/routes";
import { renderWithProviders } from "~/test-utils";
import { cashFlows, stats } from "./support/fixtures";

vi.mock("~/features/cashflows/api/cashFlowApi", () => ({
  getCashFlows: vi.fn(),
  getCashFlow: vi.fn(),
  addCashFlow: vi.fn(),
  changeCashFlow: vi.fn(),
  deleteCashFlow: vi.fn(),
  getLabels: vi.fn(),
  getDailyStats: vi.fn(),
  getMonthlyStats: vi.fn(),
  deleteAllCashFlows: vi.fn(),
}));
vi.mock("~/features/users/api/userApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  updateMe: vi.fn(),
  uploadPhoto: vi.fn(),
  changePassword: vi.fn(),
}));

const cash = cashFlowApi as unknown as Record<string, ReturnType<typeof vi.fn>>;
const user = userApi as unknown as Record<string, ReturnType<typeof vi.fn>>;

const profile = { id: 1, name: "Feny Pasaribu", email: "feny@x.id", photo: null };
const signedIn = { auth: { token: "tok" }, users: { profile } };
const wait = { timeout: 5000 };

beforeEach(() => {
  [...Object.values(cash), ...Object.values(user)].forEach((fn) => fn.mockReset());
  cash.getCashFlows!.mockResolvedValue({ cash_flows: cashFlows, stats });
  cash.getLabels!.mockResolvedValue(["gaji"]);
  user.getMe!.mockResolvedValue(profile);
  user.getUsers!.mockResolvedValue([{ id: 2, name: "Budi Santoso", email: "budi@x.id" }]);
});

describe("App (integrasi rute)", () => {
  it("menampilkan halaman login di dalam AuthLayout", async () => {
    await renderWithProviders(App, { routes, route: "/auth/login" });
    await vi.waitFor(
      () => expect(document.querySelector("#login-email-input")).toBeInTheDocument(),
      wait,
    );
    expect(document.body).toHaveTextContent("Selamat datang kembali");
    expect(document.body).toHaveTextContent("Kelola arus kas pribadi dengan lebih tenang.");
  });

  it("menampilkan halaman registrasi", async () => {
    await renderWithProviders(App, { routes, route: "/auth/register" });
    await vi.waitFor(
      () => expect(document.querySelector("#register-name-input")).toBeInTheDocument(),
      wait,
    );
    expect(document.body).toHaveTextContent("Buat akun baru");
  });

  it("menampilkan dashboard arus kas di dalam CashFlowLayout", async () => {
    await renderWithProviders(App, { routes, route: "/", initialState: signedIn });
    await vi.waitFor(() => expect(document.body).toHaveTextContent("alat-elektronik"), wait);
    expect(document.body).toHaveTextContent("Ringkasan Arus Kas");
    expect(document.body).toHaveTextContent("Feny Pasaribu");
  });

  it("berpindah halaman di dalam dashboard tanpa memuat ulang", async () => {
    const { router } = await renderWithProviders(App, {
      routes,
      route: "/",
      initialState: signedIn,
    });
    await vi.waitFor(() => expect(document.body).toHaveTextContent("alat-elektronik"), wait);

    await router.push("/users");
    await vi.waitFor(() => expect(document.body).toHaveTextContent("Budi Santoso"), wait);
    expect(document.body).toHaveTextContent("Direktori Pengguna");
  });

  it("menampilkan halaman 404 untuk alamat yang tidak dikenal", async () => {
    await renderWithProviders(App, { routes, route: "/tidak-ada" });
    await vi.waitFor(
      () => expect(document.body).toHaveTextContent("Halaman tidak ditemukan"),
      wait,
    );
  });
});