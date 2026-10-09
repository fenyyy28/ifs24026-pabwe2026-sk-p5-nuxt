import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AuthLayout from "~/features/auth/layouts/AuthLayout.vue";

describe("AuthLayout", () => {
  it("menampilkan judul, subjudul, dan slot", () => {
    const wrapper = mount(AuthLayout, {
      props: { title: "Judul", subtitle: "Subjudul" },
      slots: { default: "<p>isi form</p>", footer: "<span>tautan</span>" },
    });
    expect(wrapper.text()).toContain("Judul");
    expect(wrapper.text()).toContain("Subjudul");
    expect(wrapper.text()).toContain("isi form");
    expect(wrapper.text()).toContain("tautan");
  });
});