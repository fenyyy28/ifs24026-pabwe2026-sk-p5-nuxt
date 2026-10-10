import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as api from "~/features/cashflows/api/cashFlowApi";
import ChangeModal from "~/features/cashflows/modals/ChangeModal.vue";
import { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";
import { renderWithProviders } from "~/test-utils";
import { outflow } from "../../support/fixtures";

vi.mock("~/helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));
vi.mock("~/features/cashflows/api/cashFlowApi", () => ({
  addCashFlow: vi.fn(),
  changeCashFlow: vi.fn(),
}));

const changeCashFlow = api.changeCashFlow as unknown as ReturnType<typeof vi.fn>;
const errorDialog = showErrorDialog as unknown as ReturnType<typeof vi.fn>;
const successDialog = showSuccessDialog as unknown as ReturnType<typeof vi.fn>;

const render = () => renderWithProviders(ChangeModal, { props: { cashFlow: outflow } });

beforeEach(() => {
  changeCashFlow.mockReset();
  errorDialog.mockReset();
  successDialog.mockReset();
});

describe("ChangeModal", () => {
  it("menampilkan form dengan nilai transaksi yang dipilih", async () => {
    const { wrapper } = await render();
    expect(wrapper.text()).toContain("Ubah Transaksi");
    expect(wrapper.get("#cashflow-type-input").element).toHaveValue("outflow");
    expect(wrapper.get("#cashflow-source-input").element).toHaveValue("savings");
    expect(wrapper.get("#cashflow-label-input").element).toHaveValue("alat-elektronik");
    expect(wrapper.get("#cashflow-nominal-input").element).toHaveValue(400000);
  });

  it("mengubah transaksi lalu memberi sinyal saved", async () => {
    changeCashFlow.mockResolvedValue("Berhasil mengubah data");
    const { wrapper } = await render();
    await wrapper.get("#cashflow-nominal-input").setValue("999");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(changeCashFlow).toHaveBeenCalledWith(4, expect.objectContaining({ nominal: 999 }));
    expect(successDialog).toHaveBeenCalledWith("Berhasil mengubah data");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("menampilkan error saat gagal", async () => {
    changeCashFlow.mockRejectedValue(
      new ApiError("Data tidak valid", 400, { nominal: ["Nominal salah"] }),
    );
    const { wrapper } = await render();
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Nominal salah");
    expect(errorDialog).toHaveBeenCalledWith("Data tidak valid");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("menutup modal", async () => {
    const { wrapper } = await render();
    await wrapper.get('button[aria-label="Tutup"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});