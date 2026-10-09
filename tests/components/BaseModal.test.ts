import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import BaseModal from "~/components/BaseModal.vue";

const factory = () => mount(BaseModal, { props: { title: "Judul Modal" }, slots: { default: "<p id=\"isi\">isi</p>" } });

describe("BaseModal", () => {
  it("menampilkan judul dan slot", () => {
    const wrapper = factory();
    expect(wrapper.text()).toContain("Judul Modal");
    expect(wrapper.find("#isi").exists()).toBe(true);
  });

  it("menutup lewat tombol silang", async () => {
    const wrapper = factory();
    await wrapper.get('button[aria-label="Tutup"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("menutup saat latar diklik tetapi tidak saat isi diklik", async () => {
    const wrapper = factory();
    await wrapper.get("#isi").trigger("click");
    expect(wrapper.emitted("close")).toBeUndefined();
    await wrapper.get('[data-testid="modal-backdrop"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});