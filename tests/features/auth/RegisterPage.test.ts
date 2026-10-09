import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import * as authApi from "~/features/auth/api/authApi";
import RegisterPage from "~/features/auth/pages/RegisterPage.vue";
import { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";

const push = vi.hoisted(() => vi.fn());
vi.mock("vue-router", () => ({ useRouter: () => ({ push }) }));
vi.mock("~/helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));
vi.mock("~/features/auth/api/authApi", () => ({ login: vi.fn(), register: vi.fn() }));

const registerMock = authApi.register as unknown as ReturnType<typeof vi.fn>;
const errorDialog = showErrorDialog as unknown as ReturnType<typeof vi.fn>;
const successDialog = showSuccessDialog as unknown as ReturnType<typeof vi.fn>;

const factory = () =>
  mount(RegisterPage, {
    global: {
      plugins: [createPinia()],
      components: { NuxtLink: { template: "<a><slot /></a>" } },
    },
  });

beforeEach(() => {
  push.mockReset();
  registerMock.mockReset();
  errorDialog.mockReset();
  successDialog.mockReset();
});

describe("RegisterPage", () => {
  it("menampilkan dan menyembunyikan kata sandi", async () => {
    const wrapper = factory();
    const input = wrapper.get("#register-password-input");
    expect(input.attributes("type")).toBe("password");
    await wrapper.get('button[aria-label="Tampilkan kata sandi"]').trigger("click");
    expect(input.attributes("type")).toBe("text");
    await wrapper.get('button[aria-label="Sembunyikan kata sandi"]').trigger("click");
    expect(input.attributes("type")).toBe("password");
  });

  it("registrasi berhasil lalu pindah ke halaman login", async () => {
    registerMock.mockResolvedValue("Berhasil mendaftar");
    const wrapper = factory();
    await wrapper.get("#register-name-input").setValue("Feny");
    await wrapper.get("#register-email-input").setValue("a@b.c");
    await wrapper.get("#register-password-input").setValue("rahasia");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(registerMock).toHaveBeenCalledWith({
      name: "Feny",
      email: "a@b.c",
      password: "rahasia",
    });
    expect(successDialog).toHaveBeenCalledWith("Berhasil mendaftar");
    expect(push).toHaveBeenCalledWith("/auth/login");
  });

  it("menampilkan status loading saat memproses", async () => {
    let resolve!: (v: string) => void;
    registerMock.mockReturnValue(new Promise((r) => (resolve = r)));
    const wrapper = factory();
    await wrapper.get("form").trigger("submit");

    const button = wrapper.get("#register-submit-button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Memproses");

    resolve("ok");
    await flushPromises();
    expect(button.text()).toContain("Daftar");
  });

  it("menampilkan error validasi dan dialog saat gagal", async () => {
    registerMock.mockRejectedValue(
      new ApiError("Data tidak valid", 400, {
        name: ["Nama wajib diisi"],
        email: ["Email sudah dipakai"],
        password: ["Kata sandi terlalu pendek"],
      }),
    );
    const wrapper = factory();
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Nama wajib diisi");
    expect(wrapper.text()).toContain("Email sudah dipakai");
    expect(wrapper.text()).toContain("Kata sandi terlalu pendek");
    expect(errorDialog).toHaveBeenCalledWith("Data tidak valid");
    expect(push).not.toHaveBeenCalled();
  });
});