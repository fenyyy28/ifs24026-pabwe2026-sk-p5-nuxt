import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import * as userApi from "~/features/users/api/userApi";
import { useUsersStore } from "~/features/users/states/usersStore";

vi.mock("~/features/users/api/userApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  updateMe: vi.fn(),
  uploadPhoto: vi.fn(),
  changePassword: vi.fn(),
}));

const api = userApi as unknown as Record<string, ReturnType<typeof vi.fn>>;
const me = { id: 1, name: "Feny", email: "f@x.id" };
const passwordPayload = { password: "a", new_password: "b", new_password_confirmation: "b" };

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
  setActivePinia(createPinia());
});

describe("useUsersStore", () => {
  it("fetchUsers mengisi daftar dan mengatur loading", async () => {
    let resolve!: (v: unknown[]) => void;
    api.getUsers!.mockReturnValue(new Promise((r) => (resolve = r)));
    const store = useUsersStore();
    const pending = store.fetchUsers();
    expect(store.isLoadingUsers).toBe(true);
    resolve([me]);
    await pending;
    expect(store.isLoadingUsers).toBe(false);
    expect(store.users).toEqual([me]);
  });

  it("fetchUsers yang gagal mengembalikan loading", async () => {
    api.getUsers!.mockRejectedValue(new Error("gagal"));
    const store = useUsersStore();
    await expect(store.fetchUsers()).rejects.toThrow("gagal");
    expect(store.isLoadingUsers).toBe(false);
  });

  it("fetchProfile mengisi profil", async () => {
    api.getMe!.mockResolvedValue(me);
    const store = useUsersStore();
    await store.fetchProfile();
    expect(store.profile).toEqual(me);
    expect(store.isLoadingProfile).toBe(false);
  });

  it("updateProfile menyimpan lalu memuat ulang profil", async () => {
    api.updateMe!.mockResolvedValue("Tersimpan");
    api.getMe!.mockResolvedValue({ ...me, name: "Baru" });
    const store = useUsersStore();
    const payload = { name: "Baru", email: "f@x.id" };
    expect(await store.updateProfile(payload)).toBe("Tersimpan");
    expect(api.updateMe).toHaveBeenCalledWith(payload);
    expect(store.profile?.name).toBe("Baru");
    expect(store.isSaving).toBe(false);
  });

  it("uploadPhoto mengunggah lalu memuat ulang profil", async () => {
    api.uploadPhoto!.mockResolvedValue("Foto diubah");
    api.getMe!.mockResolvedValue(me);
    const store = useUsersStore();
    const file = new File(["x"], "a.png");
    expect(await store.uploadPhoto(file)).toBe("Foto diubah");
    expect(api.uploadPhoto).toHaveBeenCalledWith(file);
    expect(store.profile).toEqual(me);
  });

  it("changePassword mengembalikan pesan", async () => {
    api.changePassword!.mockResolvedValue("Sandi diubah");
    const store = useUsersStore();
    expect(await store.changePassword(passwordPayload)).toBe("Sandi diubah");
    expect(store.isSaving).toBe(false);
  });

  it("aksi simpan yang gagal mengembalikan isSaving", async () => {
    api.changePassword!.mockRejectedValue(new Error("gagal"));
    const store = useUsersStore();
    await expect(store.changePassword(passwordPayload)).rejects.toThrow();
    expect(store.isSaving).toBe(false);
  });

  it("clear mengosongkan data", () => {
    const store = useUsersStore();
    store.users = [me];
    store.profile = me;
    store.clear();
    expect(store.users).toEqual([]);
    expect(store.profile).toBeNull();
  });
});