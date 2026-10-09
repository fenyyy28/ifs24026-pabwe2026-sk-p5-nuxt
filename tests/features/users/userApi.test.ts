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
  it("getUsers memanggil GET /users dan menormalkan URL foto", async () => {
    get.mockResolvedValue({
      data: {
        users: [
          { id: 1, name: "A", email: "a@x.id", photo: "img/profile/1.png" },
          { id: 2, name: "B", email: "b@x.id", photo: "http://cdn.test/b.png" },
          { id: 3, name: "C", email: "c@x.id", photo: null },
        ],
      },
    });
    const users = await getUsers();
    expect(get).toHaveBeenCalledWith("/users");
    expect(users.map((u) => u.photo)).toEqual([
      "https://example.test/img/profile/1.png",
      "http://cdn.test/b.png",
      null,
    ]);
  });

  it("getMe memanggil GET /users/me dan menormalkan foto relatif", async () => {
    get.mockResolvedValue({ data: { user: { id: 1, name: "A", email: "a@x.id", photo: "img/p.png" } } });
    const me = await getMe();
    expect(get).toHaveBeenCalledWith("/users/me");
    expect(me.photo).toBe("https://example.test/img/p.png");
  });

  it("updateMe memanggil PUT /users/me", async () => {
    put.mockResolvedValue({ message: "ok" });
    const payload = { name: "n", email: "e" };
    expect(await updateMe(payload)).toBe("ok");
    expect(put).toHaveBeenCalledWith("/users/me", payload);
  });

  it("uploadPhoto mengirim FormData ke POST /users/me/photo", async () => {
    post.mockResolvedValue({ message: "foto ok" });
    const file = new File(["x"], "a.png", { type: "image/png" });
    expect(await uploadPhoto(file)).toBe("foto ok");
    const [path, form] = post.mock.calls[0]!;
    expect(path).toBe("/users/me/photo");
    expect(((form as FormData).get("photo") as File).name).toBe("a.png");
  });

  it("changePassword memanggil PUT /users/password", async () => {
    put.mockResolvedValue({ message: "sandi ok" });
    const payload = { password: "lama", new_password: "baru", new_password_confirmation: "baru" };
    expect(await changePassword(payload)).toBe("sandi ok");
    expect(put).toHaveBeenCalledWith("/users/password", payload);
  });
});