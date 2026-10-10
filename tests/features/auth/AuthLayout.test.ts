import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AuthLayout from "~/features/auth/layouts/AuthLayout.vue";

describe("AuthLayout", () => {
  it("menampilkan panel merek dan halaman anak", () => {
    const wrapper = mount(AuthLayout, {
      global: { components: { NuxtPage: { template: '<div id="page">halaman login</div>' } } },
    });
    expect(wrapper.text()).toContain("Kelola arus kas pribadi dengan lebih tenang.");
    expect(wrapper.text()).toContain("Delcom Cash Flow");
    expect(wrapper.get("#page").text()).toBe("halaman login");
  });
});