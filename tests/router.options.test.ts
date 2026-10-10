import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import routerOptions from "~/router.options";
import { routes } from "~/routes";

const options = routerOptions as unknown as { routes: (current: unknown[]) => unknown[] };

describe("router.options", () => {
  it("menyediakan rute dari routes.ts", () => {
    expect(options.routes([])).toBe(routes);
  });

  it("menghasilkan router yang bisa dipakai bernavigasi", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: options.routes([]) as never,
    });
    await router.push("/cash-flows/9");
    expect(router.currentRoute.value.name).toBe("cash-flow-detail");
    expect(router.currentRoute.value.params.cashFlowId).toBe("9");
  });
});