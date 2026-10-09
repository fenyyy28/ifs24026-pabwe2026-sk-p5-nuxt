import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import * as authApi from "~/features/auth/api/authApi";
import { useAuthStore } from "~/features/auth/states/authStore";
import { getAccessToken, putAccessToken } from "~/helpers/apiHelper";

vi.mock("~/features/auth/api/authApi", () => ({ login: vi.fn(), register: vi.fn() }));
const loginMock = authApi.login as unknown as ReturnType<typeof vi.fn>;
const registerMock = authApi.register as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  loginMock.mockReset();
  registerMock.mockReset();
  setActivePinia(createPinia());
});

describe("useAuthStore", () => {
  it("awalnya belum terautentikasi", () => {
    const store = useAuthStore();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isLoading).toBe(false);
  });

  it("memulihkan sesi dari token tersimpan", () => {
    putAccessToken("tersimpan");
    setActivePinia(createPinia());
    const store = useAuthStore();
    expect(store.token).toBe("tersimpan");
    expect(store.isAuthenticated).toBe(true);
  });

  it("login menyimpan token dan mengatur loading", async () => {
    let resolve!: (v: { token: string }) => void;
    loginMock.mockReturnValue(new Promise((r) => (resolve = r)));
    const store = useAuthStore();

    const pending = store.login({ email: "a@b.c", password: "x" });
    expect(store.isLoading).toBe(true);
    resolve({ token: "tok" });
    await pending;

    expect(store.isLoading).toBe(false);
    expect(store.token).toBe("tok");
    expect(store.isAuthenticated).toBe(true);
    expect(getAccessToken()).toBe("tok");
  });

  it("login yang gagal melempar ulang error dan mengembalikan loading", async () => {
    loginMock.mockRejectedValue(new Error("gagal"));
    const store = useAuthStore();
    await expect(store.login({ email: "a", password: "b" })).rejects.toThrow("gagal");
    expect(store.isLoading).toBe(false);
    expect(store.token).toBeNull();
  });

  it("register mengembalikan pesan server", async () => {
    registerMock.mockResolvedValue("Berhasil");
    const store = useAuthStore();
    expect(await store.register({ name: "n", email: "e", password: "p" })).toBe("Berhasil");
    expect(store.isLoading).toBe(false);
  });

  it("register yang gagal mengembalikan loading", async () => {
    registerMock.mockRejectedValue(new Error("gagal"));
    const store = useAuthStore();
    await expect(store.register({ name: "n", email: "e", password: "p" })).rejects.toThrow();
    expect(store.isLoading).toBe(false);
  });

  it("logout menghapus token", () => {
    putAccessToken("tok");
    setActivePinia(createPinia());
    const store = useAuthStore();
    store.logout();
    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});