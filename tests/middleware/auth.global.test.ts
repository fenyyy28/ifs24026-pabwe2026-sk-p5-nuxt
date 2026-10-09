import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const navigateTo = vi.hoisted(() => {
  const fn = vi.fn((path: string) => `redirect:${path}`);
  vi.stubGlobal("defineNuxtRouteMiddleware", (handler: unknown) => handler);
  vi.stubGlobal("navigateTo", fn);
  return fn;
});

import middleware from "~/middleware/auth.global";
import { putAccessToken } from "~/helpers/apiHelper";

const run = (path: string) => (middleware as unknown as (to: { path: string }) => unknown)({ path });

beforeEach(() => {
  localStorage.clear();
  navigateTo.mockClear();
  setActivePinia(createPinia());
});

describe("auth.global middleware", () => {
  it("mengarahkan tamu ke login saat membuka halaman terproteksi", () => {
    expect(run("/users")).toBe("redirect:/auth/login");
  });

  it("membiarkan tamu membuka halaman auth", () => {
    expect(run("/auth/login")).toBeUndefined();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it("mengarahkan pengguna yang sudah login keluar dari halaman auth", () => {
    putAccessToken("tok");
    setActivePinia(createPinia());
    expect(run("/auth/register")).toBe("redirect:/");
  });

  it("membiarkan pengguna login membuka halaman terproteksi", () => {
    putAccessToken("tok");
    setActivePinia(createPinia());
    expect(run("/profile")).toBeUndefined();
    expect(navigateTo).not.toHaveBeenCalled();
  });
});