import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import * as api from "~/features/cashflows/api/cashFlowApi";
import AddModal from "~/features/cashflows/modals/AddModal.vue";
import ChangeModal from "~/features/cashflows/modals/ChangeModal.vue";
import { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";
import { outflow } from "../../support/fixtures";

vi.mock("~/helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));
vi.mock("~/features/cashflows/api/cashFlowApi", () => ({
  addCashFlow: vi.fn(),
  changeCashFlow: vi.fn(),
}));

const mocked = api as unknown as Record<string, ReturnType<typeof vi.fn>>;
const errorDialog = showErrorDialog as unknown as ReturnType<typeof vi.fn>;
const successDialog = showSuccessDialog as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  Object.values(mocked).forEach((fn) => fn.mockReset());
  errorDialog.mockReset();
  successDialog.mockReset();
});

describe("AddModal", () => {
  it("menyimpan transaksi baru lalu memberi sinyal saved", async () => {
    mocked.addCashFlow!.mockResolvedValue("Berhasil menambahkan data");
    const wrapper = mount(AddModal, { global: { plugins: [createPinia()] } });
    await wrapper.get("#cashflow-label-input").setValue("gaji");
    await wrapper.get("#cashflow-nominal-input").setValue("1000");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(mocked.addCashFlow).toHaveBeenCalledWith({
      type: "inflow",
      source: "cash",
      label: "gaji",
      description: "",
      nominal: 1000,
    });
    expect(successDialog).toHaveBeenCalledWith("Berhasil menambahkan data");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("menampilkan error validasi dan tidak memberi sinyal saved", async () => {
    mocked.addCashFlow!.mockRejectedValue(
      new ApiError("Data tidak valid", 400, { label: ["Label wajib"] }),
    );
    const wrapper = mount(AddModal, { global: { plugins: [createPinia()] } });
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Label wajib");
    expect(errorDialog).toHaveBeenCalledWith("Data tidak valid");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("menutup modal", async () => {
    const wrapper = mount(AddModal, { global: { plugins: [createPinia()] } });
    await wrapper.get('button[aria-label="Tutup"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});

describe("ChangeModal", () => {
  const factory = () =>
    mount(ChangeModal, { props: { cashFlow: outflow }, global: { plugins: [createPinia()] } });

  it("mengubah transaksi dengan nilai awal terisi", async () => {
    mocked.changeCashFlow!.mockResolvedValue("Berhasil mengubah data");
    const wrapper = factory();
    expect((wrapper.get("#cashflow-label-input").element as HTMLInputElement).value).toBe("alat-elektronik");
    await wrapper.get("#cashflow-nominal-input").setValue("999");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(mocked.changeCashFlow).toHaveBeenCalledWith(4, expect.objectContaining({ nominal: 999 }));
    expect(successDialog).toHaveBeenCalledWith("Berhasil mengubah data");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("menampilkan error saat gagal", async () => {
    mocked.changeCashFlow!.mockRejectedValue(
      new ApiError("Data tidak valid", 400, { nominal: ["Nominal salah"] }),
    );
    const wrapper = factory();
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Nominal salah");
    expect(errorDialog).toHaveBeenCalledWith("Data tidak valid");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("menutup modal", async () => {
    const wrapper = factory();
    await wrapper.get('button[aria-label="Tutup"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});