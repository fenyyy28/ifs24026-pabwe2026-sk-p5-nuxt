import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { routes } from "~/routes";

const makeRouter = () => createRouter({ history: createMemoryHistory(), routes });

describe("routes", () => {
  it.each([
    ["/auth/login", "login"],
    ["/auth/register", "register"],
    ["/", "home"],
    ["/cash-flows/7", "cash-flow-detail"],
    ["/users", "users"],
    ["/profile", "profile"],
    ["/halaman/tidak/ada", "not-found"],
  ])("%s dipetakan ke rute %s", (path, name) => {
    expect(makeRouter().resolve(path).name).toBe(name);
  });

  it("meneruskan parameter cashFlowId", () => {
    expect(makeRouter().resolve("/cash-flows/42").params.cashFlowId).toBe("42");
  });

  it("mengalihkan /auth ke halaman login", async () => {
    const router = makeRouter();
    await router.push("/auth");
    expect(router.currentRoute.value.name).toBe("login");
  });

  it("auth dan dashboard masing-masing punya halaman anak", () => {
    const [auth, dashboard] = routes;
    expect(auth!.path).toBe("/auth");
    expect(auth!.children).toHaveLength(3);
    expect(dashboard!.path).toBe("/");
    expect(dashboard!.children).toHaveLength(4);
  });

  it("seluruh komponen dimuat secara lazy", async () => {
    const loaders = routes
      .flatMap((route) => [route, ...(route.children ?? [])])
      .map((route) => route.component)
      .filter(Boolean) as Array<() => Promise<{ default: unknown }>>;

    expect(loaders).toHaveLength(9);
    const modules = await Promise.all(loaders.map((load) => load()));
    expect(modules.every((m) => Boolean(m.default))).toBe(true);
  });
});