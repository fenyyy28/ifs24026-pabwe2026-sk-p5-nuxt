import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import Swal from "sweetalert2";
import * as userApi from "~/features/users/api/userApi";
import type { User } from "~/features/users/api/userApi";
import UsersPage from "~/features/users/pages/UsersPage.vue";
import { useUsersStore } from "~/features/users/states/usersStore";
import { ApiError } from "~/helpers/apiHelper";

vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));
vi.mock("~/features/users/api/userApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  updateMe: vi.fn(),
  uploadPhoto: vi.fn(),
  changePassword: vi.fn(),
}));

const getUsers = userApi.getUsers as unknown as ReturnType<typeof vi.fn>;
const fire = Swal.fire as unknown as ReturnType<typeof vi.fn>;

const me: User = { id: 1, name: "Feny", email: "f@x.id" };
const list: User[] = [
  { id: 1, name: "Feny Pasaribu", email: "feny@x.id", created_at: "2024-10-05T12:09:16.000000Z" },
  { id: 2, name: "Budi Santoso", email: "budi@x.id", photo: "https://x.test/b.png" },
];

function factory() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useUsersStore().profile = me; // agar AppLayout tidak memuat profil
  return mount(UsersPage, {
    global: { plugins: [pinia], components: { NuxtLink: { template: "<a><slot /></a>" } } },
  });
}

beforeEach(() => {
  getUsers.mockReset();
  fire.mockReset();
});

describe("UsersPage", () => {
  it("menampilkan skeleton saat memuat", async () => {
    getUsers.mockReturnValue(new Promise(() => {}));
    const wrapper = factory();
    expect(wrapper.find("#users-skeleton").exists()).toBe(true);
  });

  it("menampilkan daftar pengguna", async () => {
    getUsers.mockResolvedValue(list);
    const wrapper = factory();
    await flushPromises();
    expect(wrapper.find("#users-skeleton").exists()).toBe(false);
    expect(wrapper.text()).toContain("Feny Pasaribu");
    expect(wrapper.text()).toContain("Budi Santoso");
    expect(wrapper.text()).toContain("5 Oktober 2024");
  });

  it("memfilter berdasarkan kata kunci dan menampilkan keadaan kosong", async () => {
    getUsers.mockResolvedValue(list);
    const wrapper = factory();
    await flushPromises();

    await wrapper.get("#users-search-input").setValue("budi");
    expect(wrapper.text()).toContain("Budi Santoso");
    expect(wrapper.text()).not.toContain("Feny Pasaribu");

    await wrapper.get("#users-search-input").setValue("tidak-ada");
    expect(wrapper.find("#users-empty").exists()).toBe(true);
  });

  it("menampilkan dialog error saat gagal memuat", async () => {
    getUsers.mockRejectedValue(new ApiError("Gagal memuat", 500));
    factory();
    await flushPromises();
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal memuat" }));
  });
});