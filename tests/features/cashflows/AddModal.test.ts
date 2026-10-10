import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as api from "~/features/cashflows/api/cashFlowApi";
import AddModal from "~/features/cashflows/modals/AddModal.vue";
import { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";
import { renderWithProviders } from "~/test-utils";

vi.mock("~/helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));
vi.mock("~/features/cashflows/api/cashFlowApi", () => ({
  addCashFlow: vi.fn(),
  changeCashFlow: vi.fn(),
}));

const addCashFlow = api.addCashFlow as unknown as ReturnType<typeof vi.fn>;
const errorDialog = showErrorDialog as unknown as ReturnType<typeof vi.fn>;
const successDialog = showSuccessDialog as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  addCashFlow.mockReset();
  errorDialog.mockReset();
  successDialog.mockReset();
});

describe("AddModal", () => {
  it("menampilkan form dengan opsi label dari store", async () => {
    const { wrapper } = await renderWithProviders(AddModal, {
      initialState: { cashFlows: { labels: ["gaji", "alat-mandi"] } },
    });
    expect(wrapper.get('[role="dialog"]').element).toBeInTheDocument();
    expect(wrapper.text()).toContain("Tambah Transaksi");
    expect(wrapper.findAll("#cashflow-label-options option")).toHaveLength(2);
  });

  it("menyimpan transaksi baru lalu memberi sinyal saved", async () => {
    addCashFlow.mockResolvedValue("Berhasil menambahkan data");
    const { wrapper } = await renderWithProviders(AddModal);
    await wrapper.get("#cashflow-label-input").setValue("gaji");
    await wrapper.get("#cashflow-nominal-input").setValue("1000");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(addCashFlow).toHaveBeenCalledWith({
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
    addCashFlow.mockRejectedValue(new ApiError("Data tidak valid", 400, { label: ["Label wajib"] }));
    const { wrapper } = await renderWithProviders(AddModal);
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Label wajib");
    expect(errorDialog).toHaveBeenCalledWith("Data tidak valid");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("menutup modal", async () => {
    const { wrapper } = await renderWithProviders(AddModal);
    await wrapper.get('button[aria-label="Tutup"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});