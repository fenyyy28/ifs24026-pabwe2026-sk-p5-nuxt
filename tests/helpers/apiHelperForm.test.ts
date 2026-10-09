import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { apiPost } from "~/helpers/apiHelper";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

it("mengirim FormData apa adanya tanpa Content-Type JSON", async () => {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ status: "success", message: "OK", data: null }), { status: 200 }),
  );
  const form = new FormData();
  form.append("photo", new File(["x"], "a.png"));
  await apiPost("/users/me/photo", form);

  const [, init] = fetchMock.mock.calls[0]!;
  expect(init.body).toBe(form);
  expect(init.headers["Content-Type"]).toBeUndefined();
});