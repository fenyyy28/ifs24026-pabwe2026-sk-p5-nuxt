import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  changePassword,
  getMe,
  getUsers,
  updateMe,
  uploadPhoto,
} from "~/features/users/api/userApi";
import { apiGet, apiPost, apiPut } from "~/helpers/apiHelper";

vi.mock("~/helpers/apiHelper", () => ({ apiGet: vi.fn(), apiPost: vi.fn(), apiPut: vi.fn() }));
const get = apiGet as unknown as ReturnType<typeof vi.fn>;
const post = apiPost as unknown as ReturnType<typeof vi.fn>;
const put = apiPut as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  put.mockReset();
});

describe("userApi", () => {
  it("getUsers memanggil GET /users", async () => {
    get.mockResolvedValue({ data: { users: [{ id: 1 }] } });
    expect(await getUsers()).toEqual([{ id: 1 }]);
    expect(get).toHaveBeenCalledWith("/users");
  });

  it("getMe memanggil GET /users/me", async () => {
    get.mockResolvedValue({ data: { user: { id: 1 } } });
    expect(await getMe()).toEqual({ id: 1 });
    expect(get).toHaveBeenCalledWith("/users/me");
  });

  it("updateMe memanggil PUT /users/me", async () => {
    put.mockResolvedValue({ message: "ok" });
    const payload = { name: "n", email: "e", bio: "b" };
    expect(await updateMe(payload)).toBe("ok");
    expect(put).toHaveBeenCalledWith("/users/me", payload);
  });

  it("uploadPhoto mengirim FormData ke POST /users/me/photo", async () => {
    post.mockResolvedValue({ message: "foto ok" });
    const file = new File(["x"], "a.png", { type: "image/png" });
    expect(await uploadPhoto(file)).toBe("foto ok");
    const [path, form] = post.mock.calls[0]!;
    expect(path).toBe("/users/me/photo");
    expect((form as FormData).get("photo")).toBeInstanceOf(File);
    expect(((form as FormData).get("photo") as File).name).toBe("a.png");
  });

  it("changePassword memanggil PUT /users/me/password", async () => {
    put.mockResolvedValue({ message: "sandi ok" });
    const payload = { password: "lama", new_password: "baru" };
    expect(await changePassword(payload)).toBe("sandi ok");
    expect(put).toHaveBeenCalledWith("/users/me/password", payload);
  });
});