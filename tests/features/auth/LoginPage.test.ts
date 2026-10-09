import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import * as authApi from "~/features/auth/api/authApi";
import LoginPage from "~/features/auth/pages/LoginPage.vue";
import { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog } from "~/helpers/toolsHelper";

const push = vi.hoisted(() => vi.fn());
vi.mock("vue-router", () => ({ useRouter: () => ({ push }) }));
vi.mock("~/helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));
vi.mock("~/features/auth/api/authApi", () => ({ login: vi.fn(), register: vi.fn() }));

const loginMock = authApi.login as unknown as ReturnType<typeof vi.fn>;
const errorDialog = showErrorDialog as unknown as ReturnType<typeof vi.fn>;

const factory = () =>
  mount(LoginPage, {
    global: {
      plugins: [createPinia()],
      components: { NuxtLink: { template: "<a><slot /></a>" } },
    },
  });

beforeEach(() => {
  localStorage.clear();
  push.mockReset();
  loginMock.mockReset();
  errorDialog.mockReset();
});

describe("LoginPage", () => {
  it("menampilkan dan menyembunyikan kata sandi", async () => {
    const wrapper = factory();
    const input = wrapper.get("#login-password-input");
    expect(input.attributes("type")).toBe("password");
    await wrapper.get('button[aria-label="Tampilkan kata sandi"]').trigger("click");
    expect(input.attributes("type")).toBe("text");
    await wrapper.get('button[aria-label="Sembunyikan kata sandi"]').trigger("click");
    expect(input.attributes("type")).toBe("password");
  });

  it("login berhasil lalu pindah ke beranda", async () => {
    loginMock.mockResolvedValue({ token: "tok" });
    const wrapper = factory();
    await wrapper.get("#login-email-input").setValue("a@b.c");
    await wrapper.get("#login-password-input").setValue("rahasia");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(loginMock).toHaveBeenCalledWith({ email: "a@b.c", password: "rahasia" });
    expect(push).toHaveBeenCalledWith("/");
  });

  it("menampilkan status loading saat memproses", async () => {
    let resolve!: (v: { token: string }) => void;
    loginMock.mockReturnValue(new Promise((r) => (resolve = r)));
    const wrapper = factory();
    await wrapper.get("form").trigger("submit");

    const button = wrapper.get("#login-submit-button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Memproses");

    resolve({ token: "tok" });
    await flushPromises();
    expect(button.attributes("disabled")).toBeUndefined();
    expect(button.text()).toContain("Masuk");
  });

  it("menampilkan error validasi dan dialog saat gagal", async () => {
    loginMock.mockRejectedValue(
      new ApiError("Data tidak valid", 400, {
        email: ["Email tidak valid"],
        password: ["Kata sandi salah"],
      }),
    );
    const wrapper = factory();
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Email tidak valid");
    expect(wrapper.text()).toContain("Kata sandi salah");
    expect(errorDialog).toHaveBeenCalledWith("Data tidak valid");
    expect(push).not.toHaveBeenCalled();
  });
});