import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  apiRequest,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "~/helpers/apiHelper";

const fetchMock = vi.fn();
const BASE = "https://example.test/api/v1";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const ok = { status: "success", message: "OK", data: { x: 1 } };

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("token storage", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("ApiError", () => {
  it("memakai nilai default", () => {
    const err = new ApiError("gagal");
    expect(err.name).toBe("ApiError");
    expect(err.message).toBe("gagal");
    expect(err.statusCode).toBe(0);
    expect(err.errors).toEqual({});
  });

  it("menyimpan statusCode dan errors", () => {
    const err = new ApiError("gagal", 422, { label: ["wajib"] });
    expect(err.statusCode).toBe(422);
    expect(err.errors).toEqual({ label: ["wajib"] });
  });
});

describe("apiRequest", () => {
  it("GET tanpa opsi dan tanpa token", async () => {
    fetchMock.mockResolvedValue(jsonResponse(ok));
    const res = await apiRequest("/cash-flows");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASE}/cash-flows`);
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBeUndefined();
    expect(init.headers["Content-Type"]).toBeUndefined();
    expect(init.body).toBeUndefined();
    expect(res.data).toEqual({ x: 1 });
  });

  it("menyertakan Bearer token dan menyaring query kosong", async () => {
    putAccessToken("tok");
    fetchMock.mockResolvedValue(jsonResponse(ok));
    await apiGet("cash-flows", {
      type: "inflow",
      n: 0,
      label: "",
      a: undefined,
      b: null,
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASE}/cash-flows?type=inflow&n=0`);
    expect(init.headers.Authorization).toBe("Bearer tok");
  });

  it("POST mengirim body JSON dan bisa melewati auth", async () => {
    putAccessToken("tok");
    fetchMock.mockResolvedValue(jsonResponse(ok));
    await apiPost("/auth/login", { email: "a" }, false);
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers.Authorization).toBeUndefined();
    expect(init.body).toBe(JSON.stringify({ email: "a" }));
  });

  it("pintasan memakai method dan argumen default maupun eksplisit", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(ok)));
    await apiGet("/a");
    await apiGet("/a", undefined, false);
    await apiPost("/a");
    await apiPut("/a", { y: 1 });
    await apiPut("/a", { y: 1 }, false);
    await apiDelete("/a");
    await apiDelete("/a", false);
    const methods = fetchMock.mock.calls.map((c) => c[1].method);
    expect(methods).toEqual(["GET", "GET", "POST", "PUT", "PUT", "DELETE", "DELETE"]);
  });

  it("melempar ApiError saat jaringan gagal", async () => {
    fetchMock.mockRejectedValue(new TypeError("network"));
    const err = await apiRequest("/a").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(0);
    expect(err.message).toContain("Tidak dapat terhubung");
  });

  it("memakai pesan fallback saat respons bukan JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));
    const err = await apiRequest("/a").catch((e) => e);
    expect(err.message).toBe("Permintaan gagal (500)");
    expect(err.statusCode).toBe(500);
    expect(err.errors).toEqual({});
  });

  it("menganggap 200 tanpa JSON valid sebagai gagal", async () => {
    fetchMock.mockResolvedValue(new Response("abc", { status: 200 }));
    const err = await apiRequest("/a").catch((e) => e);
    expect(err.message).toBe("Permintaan gagal (200)");
  });

  it("menghapus token saat 401", async () => {
    putAccessToken("tok");
    fetchMock.mockResolvedValue(
      jsonResponse({ status: "fail", message: "Unauthenticated." }, 401),
    );
    const err = await apiRequest("/a").catch((e) => e);
    expect(err.message).toBe("Unauthenticated.");
    expect(err.statusCode).toBe(401);
    expect(getAccessToken()).toBeNull();
  });

  it("membawa pesan validasi per field", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { status: "fail", message: "Data tidak valid", data: { label: ["wajib"] } },
        400,
      ),
    );
    const err = await apiRequest("/a").catch((e) => e);
    expect(err.errors).toEqual({ label: ["wajib"] });
  });

  it("menganggap status bukan success sebagai gagal walau HTTP 200", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ status: "fail", message: "Ditolak", data: null }),
    );
    const err = await apiRequest("/a").catch((e) => e);
    expect(err.message).toBe("Ditolak");
    expect(err.errors).toEqual({});
  });

  it("errors kosong bila data berupa nilai primitif", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ status: "fail", message: "Ditolak", data: "teks" }, 400),
    );
    const err = await apiRequest("/a").catch((e) => e);
    expect(err.errors).toEqual({});
  });
});