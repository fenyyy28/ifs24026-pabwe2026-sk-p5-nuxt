import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import Swal from "sweetalert2";
import * as api from "~/features/cashflows/api/cashFlowApi";
import HomePage from "~/features/cashflows/pages/HomePage.vue";
import { ApiError } from "~/helpers/apiHelper";
import { cashFlows, stats } from "../../support/fixtures";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));
vi.mock("~/features/cashflows/api/cashFlowApi", () => ({
  getCashFlows: vi.fn(),
  getCashFlow: vi.fn(),
  addCashFlow: vi.fn(),
  changeCashFlow: vi.fn(),
  deleteCashFlow: vi.fn(),
  getLabels: vi.fn(),
  getDailyStats: vi.fn(),
  getMonthlyStats: vi.fn(),
  deleteAllCashFlows: vi.fn(),
}));
vi.mock("~/features/cashflows/modals/AddModal.vue", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    default: defineComponent({
      name: "AddModal",
      emits: ["close", "saved"],
      setup: (_, { emit }) => () =>
        h("div", { id: "add-modal" }, [
          h("button", { id: "add-saved", onClick: () => emit("saved") }),
          h("button", { id: "add-close", onClick: () => emit("close") }),
        ]),
    }),
  };
});
vi.mock("~/features/cashflows/modals/ChangeModal.vue", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    default: defineComponent({
      name: "ChangeModal",
      props: ["cashFlow"],
      emits: ["close", "saved"],
      setup: (props, { emit }) => () =>
        h("div", { id: "change-modal", "data-id": String((props.cashFlow as { id: number }).id) }, [
          h("button", { id: "change-saved", onClick: () => emit("saved") }),
          h("button", { id: "change-close", onClick: () => emit("close") }),
        ]),
    }),
  };
});

const mocked = api as unknown as Record<string, ReturnType<typeof vi.fn>>;
const fire = Swal.fire as unknown as ReturnType<typeof vi.fn>;

function factory() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return mount(HomePage, {
    global: { plugins: [pinia], components: { NuxtLink: { template: "<a><slot /></a>" } } },
  });
}

beforeEach(() => {
  Object.values(mocked).forEach((fn) => fn.mockReset());
  fire.mockReset();
  fire.mockResolvedValue({ isConfirmed: true });
  mocked.getCashFlows!.mockResolvedValue({ cash_flows: cashFlows, stats });
  mocked.getLabels!.mockResolvedValue(["gaji", "alat-elektronik"]);
});

describe("HomePage", () => {
  it("menampilkan skeleton saat memuat", () => {
    mocked.getCashFlows!.mockReturnValue(new Promise(() => {}));
    const wrapper = factory();
    expect(wrapper.find("#cashflow-skeleton").exists()).toBe(true);
  });

  it("menampilkan ringkasan saldo dan daftar transaksi", async () => {
    const wrapper = factory();
    await flushPromises();

    expect(wrapper.find("#cashflow-skeleton").exists()).toBe(false);
    const text = wrapper.text();
    expect(text).toContain("Total Saldo Kas Bersih");
    expect(text).toContain("Rp 2.100.000");
    expect(text).toContain("Rp 2.500.000");
    expect(text).toContain("Saldo Rekening Tabungan");
    expect(text).toContain("-Rp 400.000");
    expect(text).toContain("alat-elektronik");
    expect(text).toContain("Pemasukan");
    expect(text).toContain("Pengeluaran");
    expect(text).toContain("Tabungan");
  });

  it("menampilkan keadaan kosong", async () => {
    mocked.getCashFlows!.mockResolvedValue({ cash_flows: [], stats });
    const wrapper = factory();
    await flushPromises();
    expect(wrapper.find("#cashflow-empty").exists()).toBe(true);
  });

  it("menampilkan dialog error saat gagal memuat", async () => {
    mocked.getCashFlows!.mockRejectedValue(new ApiError("Gagal memuat", 500));
    factory();
    await flushPromises();
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal memuat" }));
  });

  it("memuat ulang saat filter berubah dan bisa diatur ulang", async () => {
    const wrapper = factory();
    await flushPromises();
    expect(wrapper.find("#filter-reset-button").exists()).toBe(false);

    await wrapper.get("#filter-type-select").setValue("outflow");
    await wrapper.get("#filter-source-select").setValue("cash");
    await wrapper.get("#filter-label-select").setValue("gaji");
    await wrapper.get("#filter-start-input").setValue("2024-10-01");
    await wrapper.get("#filter-end-input").setValue("2024-10-31");
    await flushPromises();

    expect(mocked.getCashFlows).toHaveBeenLastCalledWith({
      type: "outflow",
      source: "cash",
      label: "gaji",
      start_date: "2024-10-01 00:00:00",
      end_date: "2024-10-31 23:59:59",
    });

    await wrapper.get("#filter-reset-button").trigger("click");
    await flushPromises();
    expect(mocked.getCashFlows).toHaveBeenLastCalledWith({
      type: "",
      source: "",
      label: "",
      start_date: "",
      end_date: "",
    });
    expect(wrapper.find("#filter-reset-button").exists()).toBe(false);
  });

  it("membuka, menutup, dan menyimpan lewat modal tambah", async () => {
    const wrapper = factory();
    await flushPromises();
    expect(wrapper.find("#add-modal").exists()).toBe(false);

    await wrapper.get("#add-cashflow-button").trigger("click");
    expect(wrapper.find("#add-modal").exists()).toBe(true);
    await wrapper.get("#add-close").trigger("click");
    expect(wrapper.find("#add-modal").exists()).toBe(false);

    await wrapper.get("#add-cashflow-button").trigger("click");
    const callsBefore = mocked.getCashFlows!.mock.calls.length;
    await wrapper.get("#add-saved").trigger("click");
    await flushPromises();
    expect(wrapper.find("#add-modal").exists()).toBe(false);
    expect(mocked.getCashFlows!.mock.calls.length).toBe(callsBefore + 1);
  });

  it("membuka modal ubah untuk transaksi yang dipilih", async () => {
    const wrapper = factory();
    await flushPromises();
    await wrapper.findAll('[data-action="edit"]')[0]!.trigger("click");
    expect(wrapper.get("#change-modal").attributes("data-id")).toBe("4");

    await wrapper.get("#change-close").trigger("click");
    expect(wrapper.find("#change-modal").exists()).toBe(false);

    await wrapper.findAll('[data-action="edit"]')[0]!.trigger("click");
    const callsBefore = mocked.getCashFlows!.mock.calls.length;
    await wrapper.get("#change-saved").trigger("click");
    await flushPromises();
    expect(wrapper.find("#change-modal").exists()).toBe(false);
    expect(mocked.getCashFlows!.mock.calls.length).toBe(callsBefore + 1);
  });

  it("menghapus transaksi setelah konfirmasi", async () => {
    mocked.deleteCashFlow!.mockResolvedValue("Berhasil menghapus data");
    const wrapper = factory();
    await flushPromises();
    const callsBefore = mocked.getCashFlows!.mock.calls.length;

    await wrapper.findAll('[data-action="delete"]')[0]!.trigger("click");
    await flushPromises();

    expect(mocked.deleteCashFlow).toHaveBeenCalledWith(4);
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Berhasil menghapus data" }));
    expect(mocked.getCashFlows!.mock.calls.length).toBe(callsBefore + 1);
  });

  it("tidak menghapus bila konfirmasi dibatalkan", async () => {
    fire.mockResolvedValue({ isConfirmed: false });
    const wrapper = factory();
    await flushPromises();
    await wrapper.findAll('[data-action="delete"]')[0]!.trigger("click");
    await flushPromises();
    expect(mocked.deleteCashFlow).not.toHaveBeenCalled();
  });

  it("menampilkan dialog error saat hapus gagal", async () => {
    mocked.deleteCashFlow!.mockRejectedValue(new ApiError("Gagal hapus", 400));
    const wrapper = factory();
    await flushPromises();
    await wrapper.findAll('[data-action="delete"]')[0]!.trigger("click");
    await flushPromises();
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal hapus" }));
  });

  it("mereset semua transaksi setelah konfirmasi", async () => {
    mocked.deleteAllCashFlows!.mockResolvedValue("Berhasil menghapus semua data cash flow");
    const wrapper = factory();
    await flushPromises();
    await wrapper.get("#reset-all-button").trigger("click");
    await flushPromises();
    expect(mocked.deleteAllCashFlows).toHaveBeenCalledTimes(1);
  });

  it("tidak mereset bila konfirmasi dibatalkan", async () => {
    fire.mockResolvedValue({ isConfirmed: false });
    const wrapper = factory();
    await flushPromises();
    await wrapper.get("#reset-all-button").trigger("click");
    await flushPromises();
    expect(mocked.deleteAllCashFlows).not.toHaveBeenCalled();
  });
});