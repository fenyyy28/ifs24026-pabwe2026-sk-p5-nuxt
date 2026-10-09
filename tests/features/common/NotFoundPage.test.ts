import { expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import NotFoundPage from "~/features/common/pages/NotFoundPage.vue";

it("menampilkan pesan 404 dan tautan kembali", () => {
  const wrapper = mount(NotFoundPage, {
    global: { components: { NuxtLink: { template: "<a><slot /></a>" } } },
  });
  expect(wrapper.text()).toContain("404");
  expect(wrapper.text()).toContain("Halaman tidak ditemukan");
  expect(wrapper.text()).toContain("Kembali ke beranda");
});