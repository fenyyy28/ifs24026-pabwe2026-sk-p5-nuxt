import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import Swal from "sweetalert2";
import * as api from "~/features/cashflows/api/cashFlowApi";
import DetailPage from "~/features/cashflows/pages/DetailPage.vue";
import { ApiError } from "~/helpers/apiHelper";
import { outflow } from "../../support/fixtures";

const push = vi.hoisted(() => vi.fn());
vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { cashFlowId: "4" } }),
  useRouter: () => ({ push }),
}));
vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));
vi.mock("~/features/cashflows/api/cashFlowApi", () => ({
  getCashFlow: vi.fn(),
  changeCashFlow: vi.fn(),
  deleteCashFlow: vi.fn(),
}));
vi.mock("~/features/cashflows/modals/ChangeModal.vue", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    default: defineComponent({
      name: "ChangeModal",
      props: ["cashFlow"],
      emits: ["close", "saved"],
      setup: (_, { emit }) => () =>
        h("div", { id: "change-modal" }, [
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
  return mount(DetailPage, {
    global: { plugins: [pinia], components: { NuxtLink: { template: "<a><slot /></a>" } } },
  });
}

beforeEach(() => {
  Object.values(mocked).forEach((fn) => fn.mockReset());
  fire.mockReset();
  fire.mockResolvedValue({ isConfirmed: true });
  push.mockReset();
  mocked.getCashFlow!.mockResolvedValue(outflow);
});

describe("DetailPage", () => {
  it("menampilkan skeleton saat memuat", () => {
    mocked.getCashFlow!.mockReturnValue(new Promise(() => {}));
    const wrapper = factory();
    expect(wrapper.find("#detail-skeleton").exists()).toBe(true);
  });

  it("menampilkan rincian transaksi", async () => {
    const wrapper = factory();
    await flushPromises();
    expect(mocked.getCashFlow).toHaveBeenCalledWith("4");
    const text = wrapper.text();
    expect(text).toContain("alat-elektronik");
    expect(text).toContain("Pengeluaran");
    expect(text).toContain("Tabungan");
    expect(text).toContain("Rp 400.000");
    expect(text).toContain("Membeli keyboard dan mouse");
    expect(text).toContain("5 Okt 2024, 19.09");
  });

  it("menampilkan dialog dan kembali ke beranda saat gagal memuat", async () => {
    mocked.getCashFlow!.mockRejectedValue(new ApiError("Data tidak ditemukan", 404));
    factory();
    await flushPromises();
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Data tidak ditemukan" }));
    expect(push).toHaveBeenCalledWith("/");
  });

  it("membuka modal ubah, menutup, lalu memuat ulang setelah tersimpan", async () => {
    const wrapper = factory();
    await flushPromises();

    await wrapper.get("#detail-change-button").trigger("click");
    expect(wrapper.find("#change-modal").exists()).toBe(true);
    await wrapper.get("#change-close").trigger("click");
    expect(wrapper.find("#change-modal").exists()).toBe(false);

    await wrapper.get("#detail-change-button").trigger("click");
    await wrapper.get("#change-saved").trigger("click");
    await flushPromises();
    expect(wrapper.find("#change-modal").exists()).toBe(false);
    expect(mocked.getCashFlow).toHaveBeenCalledTimes(2);
  });

  it("menghapus transaksi lalu kembali ke beranda", async () => {
    mocked.deleteCashFlow!.mockResolvedValue("Berhasil menghapus data");
    const wrapper = factory();
    await flushPromises();
    await wrapper.get("#detail-delete-button").trigger("click");
    await flushPromises();
    expect(mocked.deleteCashFlow).toHaveBeenCalledWith("4");
    expect(push).toHaveBeenCalledWith("/");
  });

  it("tidak menghapus bila konfirmasi dibatalkan", async () => {
    fire.mockResolvedValue({ isConfirmed: false });
    const wrapper = factory();
    await flushPromises();
    await wrapper.get("#detail-delete-button").trigger("click");
    await flushPromises();
    expect(mocked.deleteCashFlow).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("menampilkan dialog error saat hapus gagal", async () => {
    mocked.deleteCashFlow!.mockRejectedValue(new ApiError("Gagal hapus", 400));
    const wrapper = factory();
    await flushPromises();
    await wrapper.get("#detail-delete-button").trigger("click");
    await flushPromises();
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal hapus" }));
    expect(push).not.toHaveBeenCalled();
  });
});