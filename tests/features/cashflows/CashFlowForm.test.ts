import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CashFlowForm from "~/features/cashflows/components/CashFlowForm.vue";
import { outflow } from "../../support/fixtures";

const base = { labels: ["gaji", "alat-mandi"], isSubmitting: false, errors: {}, submitText: "Simpan" };

describe("CashFlowForm", () => {
  it("memakai nilai awal bawaan dan menampilkan opsi label", () => {
    const wrapper = mount(CashFlowForm, { props: base });
    expect((wrapper.get("#cashflow-type-input").element as HTMLSelectElement).value).toBe("inflow");
    expect((wrapper.get("#cashflow-source-input").element as HTMLSelectElement).value).toBe("cash");
    expect(wrapper.findAll("#cashflow-label-options option")).toHaveLength(2);
    expect(wrapper.get("#cashflow-submit-button").text()).toContain("Simpan");
  });

  it("memakai data transaksi yang diubah sebagai nilai awal", () => {
    const wrapper = mount(CashFlowForm, { props: { ...base, initial: outflow } });
    expect((wrapper.get("#cashflow-type-input").element as HTMLSelectElement).value).toBe("outflow");
    expect((wrapper.get("#cashflow-label-input").element as HTMLInputElement).value).toBe("alat-elektronik");
    expect((wrapper.get("#cashflow-nominal-input").element as HTMLInputElement).value).toBe("400000");
  });

  it("mengirim payload yang sudah dirapikan", async () => {
    const wrapper = mount(CashFlowForm, { props: base });
    await wrapper.get("#cashflow-type-input").setValue("outflow");
    await wrapper.get("#cashflow-source-input").setValue("loans");
    await wrapper.get("#cashflow-label-input").setValue("  belanja  ");
    await wrapper.get("#cashflow-nominal-input").setValue("5000");
    await wrapper.get("#cashflow-description-input").setValue("Catatan");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.emitted("submit")![0]![0]).toEqual({
      type: "outflow",
      source: "loans",
      label: "belanja",
      description: "Catatan",
      nominal: 5000,
    });
  });

  it("menampilkan error semua field", () => {
    const wrapper = mount(CashFlowForm, {
      props: {
        ...base,
        errors: {
          type: ["Jenis salah"],
          source: ["Sumber salah"],
          label: ["Label wajib"],
          nominal: ["Nominal wajib"],
          description: ["Deskripsi wajib"],
        },
      },
    });
    for (const text of ["Jenis salah", "Sumber salah", "Label wajib", "Nominal wajib", "Deskripsi wajib"]) {
      expect(wrapper.text()).toContain(text);
    }
  });

  it("menonaktifkan tombol saat mengirim", () => {
    const wrapper = mount(CashFlowForm, { props: { ...base, isSubmitting: true } });
    expect(wrapper.get("#cashflow-submit-button").attributes("disabled")).toBeDefined();
  });
});