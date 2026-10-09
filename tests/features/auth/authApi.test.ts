import { beforeEach, describe, expect, it, vi } from "vitest";
import { login, register } from "~/features/auth/api/authApi";
import { apiPost } from "~/helpers/apiHelper";

vi.mock("~/helpers/apiHelper", () => ({ apiPost: vi.fn() }));
const post = apiPost as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => post.mockReset());

describe("authApi", () => {
  it("login memanggil POST /auth/login tanpa token dan mengembalikan data", async () => {
    post.mockResolvedValue({ data: { token: "tok" } });
    const payload = { email: "a@b.c", password: "rahasia" };
    expect(await login(payload)).toEqual({ token: "tok" });
    expect(post).toHaveBeenCalledWith("/auth/login", payload, false);
  });

  it("register memanggil POST /auth/register dan mengembalikan pesan", async () => {
    post.mockResolvedValue({ message: "Berhasil mendaftar" });
    const payload = { name: "Feny", email: "a@b.c", password: "rahasia" };
    expect(await register(payload)).toBe("Berhasil mendaftar");
    expect(post).toHaveBeenCalledWith("/auth/register", payload, false);
  });
});