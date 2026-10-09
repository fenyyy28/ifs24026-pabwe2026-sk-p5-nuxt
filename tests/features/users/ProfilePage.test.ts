import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import * as userApi from "~/features/users/api/userApi";
import type { User } from "~/features/users/api/userApi";
import ProfilePage from "~/features/users/pages/ProfilePage.vue";
import { useUsersStore } from "~/features/users/states/usersStore";
import { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";

vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("~/helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));
vi.mock("~/features/users/api/userApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  updateMe: vi.fn(),
  uploadPhoto: vi.fn(),
  changePassword: vi.fn(),
}));

const api = userApi as unknown as Record<string, ReturnType<typeof vi.fn>>;
const errorDialog = showErrorDialog as unknown as ReturnType<typeof vi.fn>;
const successDialog = showSuccessDialog as unknown as ReturnType<typeof vi.fn>;

const profile: User = { id: 1, name: "Feny", email: "f@x.id", photo: null, bio: "Halo" };

function factory(initial: User | null = profile) {
  const pinia = createPinia();
  setActivePinia(pinia);
  useUsersStore().profile = initial;
  return mount(ProfilePage, {
    global: { plugins: [pinia], components: { NuxtLink: { template: "<a><slot /></a>" } } },
  });
}

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
  errorDialog.mockReset();
  successDialog.mockReset();
});

describe("ProfilePage", () => {
  it("menampilkan skeleton saat profil belum ada", () => {
    api.getMe!.mockReturnValue(new Promise(() => {}));
    const wrapper = factory(null);
    expect(wrapper.find("#profile-skeleton").exists()).toBe(true);
  });

  it("mengisi form dari profil (bio kosong menjadi string kosong)", () => {
    const wrapper = factory();
    expect((wrapper.get("#profile-name-input").element as HTMLInputElement).value).toBe("Feny");
    expect((wrapper.get("#profile-email-input").element as HTMLInputElement).value).toBe("f@x.id");
    expect((wrapper.get("#profile-bio-input").element as HTMLTextAreaElement).value).toBe("Halo");

    const noBio = factory({ ...profile, bio: null });
    expect((noBio.get("#profile-bio-input").element as HTMLTextAreaElement).value).toBe("");
  });

  it("menyimpan profil", async () => {
    api.updateMe!.mockResolvedValue("Profil diperbarui");
    api.getMe!.mockResolvedValue({ ...profile, name: "Baru" });
    const wrapper = factory();
    await wrapper.get("#profile-name-input").setValue("Baru");
    await wrapper.get("#profile-email-input").setValue("baru@x.id");
    await wrapper.get("#profile-bio-input").setValue("Bio baru");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(api.updateMe).toHaveBeenCalledWith({ name: "Baru", email: "baru@x.id", bio: "Bio baru" });
    expect(successDialog).toHaveBeenCalledWith("Profil diperbarui");
  });

  it("menampilkan error validasi profil", async () => {
    api.updateMe!.mockRejectedValue(
      new ApiError("Data tidak valid", 400, {
        name: ["Nama wajib"],
        email: ["Email tidak valid"],
        bio: ["Bio terlalu panjang"],
      }),
    );
    const wrapper = factory();
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Nama wajib");
    expect(wrapper.text()).toContain("Email tidak valid");
    expect(wrapper.text()).toContain("Bio terlalu panjang");
    expect(errorDialog).toHaveBeenCalledWith("Data tidak valid");
  });

  it("mengunggah foto", async () => {
    api.uploadPhoto!.mockResolvedValue("Foto diubah");
    api.getMe!.mockResolvedValue(profile);
    const wrapper = factory();
    const input = wrapper.get("#profile-photo-input");
    const file = new File(["x"], "a.png", { type: "image/png" });
    Object.defineProperty(input.element, "files", { value: [file], configurable: true });
    await input.trigger("change");
    await flushPromises();

    expect(api.uploadPhoto).toHaveBeenCalledWith(file);
    expect(successDialog).toHaveBeenCalledWith("Foto diubah");
  });

  it("tidak melakukan apa pun bila tidak ada berkas dipilih", async () => {
    const wrapper = factory();
    await wrapper.get("#profile-photo-input").trigger("change");
    await flushPromises();
    expect(api.uploadPhoto).not.toHaveBeenCalled();
  });

  it("menampilkan error unggah foto", async () => {
    api.uploadPhoto!.mockRejectedValue(
      new ApiError("Gagal unggah", 400, { photo: ["Berkas harus gambar"] }),
    );
    const wrapper = factory();
    const input = wrapper.get("#profile-photo-input");
    Object.defineProperty(input.element, "files", {
      value: [new File(["x"], "a.txt")],
      configurable: true,
    });
    await input.trigger("change");
    await flushPromises();

    expect(wrapper.text()).toContain("Berkas harus gambar");
    expect(errorDialog).toHaveBeenCalledWith("Gagal unggah");
  });

  it("mengubah kata sandi lalu mengosongkan form", async () => {
    api.changePassword!.mockResolvedValue("Sandi diubah");
    const wrapper = factory();
    await wrapper.get("#profile-current-password-input").setValue("lama");
    await wrapper.get("#profile-new-password-input").setValue("baru");
    const forms = wrapper.findAll("form");
    await forms[1]!.trigger("submit");
    await flushPromises();

    expect(api.changePassword).toHaveBeenCalledWith({ password: "lama", new_password: "baru" });
    expect(successDialog).toHaveBeenCalledWith("Sandi diubah");
    expect((wrapper.get("#profile-current-password-input").element as HTMLInputElement).value).toBe("");
    expect((wrapper.get("#profile-new-password-input").element as HTMLInputElement).value).toBe("");
  });

  it("menampilkan error kata sandi dan mempertahankan isi form", async () => {
    api.changePassword!.mockRejectedValue(
      new ApiError("Data tidak valid", 400, {
        password: ["Kata sandi lama salah"],
        new_password: ["Kata sandi baru terlalu pendek"],
      }),
    );
    const wrapper = factory();
    await wrapper.get("#profile-current-password-input").setValue("salah");
    const forms = wrapper.findAll("form");
    await forms[1]!.trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Kata sandi lama salah");
    expect(wrapper.text()).toContain("Kata sandi baru terlalu pendek");
    expect((wrapper.get("#profile-current-password-input").element as HTMLInputElement).value).toBe("salah");
  });
});