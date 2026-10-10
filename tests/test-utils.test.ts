import { describe, expect, it } from "vitest";
import { defineComponent, h, resolveComponent } from "vue";
import { useAuthStore } from "~/features/auth/states/authStore";
import { useCashFlowsStore } from "~/features/cashflows/states/cashFlowsStore";
import { useUsersStore } from "~/features/users/states/usersStore";
import { createMockPinia, renderWithProviders } from "~/test-utils";
import { inflow } from "./support/fixtures";

const profile = { id: 1, name: "Feny", email: "f@x.id" };

const Probe = defineComponent({
  props: { msg: { type: String, default: "halo" } },
  setup(props, { slots }) {
    return () =>
      h("div", { id: "probe" }, [
        h("span", props.msg),
        h(resolveComponent("NuxtLink") as never, { to: "/users" }, () => "ke users"),
        slots.default?.(),
      ]);
  },
});

describe("createMockPinia", () => {
  it("membuat store dengan nilai bawaan bila tanpa keadaan awal", () => {
    createMockPinia();
    expect(useAuthStore().token).toBeNull();
    expect(useUsersStore().profile).toBeNull();
    expect(useCashFlowsStore().cashFlows).toEqual([]);
  });

  it("mengisi store sesuai keadaan awal", () => {
    createMockPinia({
      auth: { token: "tok" },
      users: { profile },
      cashFlows: { cashFlows: [inflow] },
    });
    expect(useAuthStore().token).toBe("tok");
    expect(useAuthStore().isAuthenticated).toBe(true);
    expect(useUsersStore().profile).toEqual(profile);
    expect(useCashFlowsStore().cashFlows).toEqual([inflow]);
  });
});

describe("renderWithProviders", () => {
  it("memakai nilai bawaan: rute '/', NuxtLink menjadi tautan sungguhan", async () => {
    const { wrapper, router } = await renderWithProviders(Probe);
    expect(router.currentRoute.value.path).toBe("/");
    expect(wrapper.get("#probe").element).toBeInTheDocument();
    expect(wrapper.get("a").element).toHaveAttribute("href", "/users");
  });

  it("menerima props, slot, rute, dan keadaan awal", async () => {
    const { wrapper, router, pinia } = await renderWithProviders(Probe, {
      props: { msg: "Dunia" },
      slots: { default: '<p id="slot">isi slot</p>' },
      route: "/users",
      routes: [{ path: "/users", component: { render: () => null } }],
      initialState: { users: { profile } },
    });
    expect(wrapper.text()).toContain("Dunia");
    expect(wrapper.get("#slot").element).toHaveTextContent("isi slot");
    expect(router.currentRoute.value.path).toBe("/users");
    expect(useUsersStore(pinia).profile).toEqual(profile);
  });

  it("rute bawaan menampilkan NuxtPage tanpa isi", async () => {
    const Host = defineComponent({
      setup: () => () => h("section", { id: "host" }, [h(resolveComponent("NuxtPage") as never)]),
    });
    const { wrapper } = await renderWithProviders(Host);
    expect(wrapper.get("#host").element).toBeInTheDocument();
    expect(wrapper.get("#host").text()).toBe("");
  });});