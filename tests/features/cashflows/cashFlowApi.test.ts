import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addCashFlow,
  changeCashFlow,
  deleteAllCashFlows,
  deleteCashFlow,
  getCashFlow,
  getCashFlows,
  getDailyStats,
  getLabels,
  getMonthlyStats,
} from "~/features/cashflows/api/cashFlowApi";
import { apiDelete, apiGet, apiPost, apiPut } from "~/helpers/apiHelper";

vi.mock("~/helpers/apiHelper", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));
const get = apiGet as unknown as ReturnType<typeof vi.fn>;
const post = apiPost as unknown as ReturnType<typeof vi.fn>;
const put = apiPut as unknown as ReturnType<typeof vi.fn>;
const del = apiDelete as unknown as ReturnType<typeof vi.fn>;

const payload = { type: "inflow", source: "cash", label: "gaji", description: "x", nominal: 1 } as const;

beforeEach(() => {
  [get, post, put, del].forEach((fn) => fn.mockReset());
});

describe("cashFlowApi", () => {
  it("getCashFlows dengan dan tanpa parameter", async () => {
    get.mockResolvedValue({ data: { cash_flows: [], stats: {} } });
    expect(await getCashFlows()).toEqual({ cash_flows: [], stats: {} });
    expect(get).toHaveBeenLastCalledWith("/cash-flows", {});
    await getCashFlows({ type: "inflow", label: "gaji" });
    expect(get).toHaveBeenLastCalledWith("/cash-flows", { type: "inflow", label: "gaji" });
  });

  it("getCashFlow mengambil detail berdasarkan id", async () => {
    get.mockResolvedValue({ data: { cash_flow: { id: 5 } } });
    expect(await getCashFlow(5)).toEqual({ id: 5 });
    expect(get).toHaveBeenCalledWith("/cash-flows/5");
  });

  it("addCashFlow memanggil POST /cash-flows", async () => {
    post.mockResolvedValue({ message: "ditambah" });
    expect(await addCashFlow(payload)).toBe("ditambah");
    expect(post).toHaveBeenCalledWith("/cash-flows", payload);
  });

  it("changeCashFlow memanggil PUT /cash-flows/:id", async () => {
    put.mockResolvedValue({ message: "diubah" });
    expect(await changeCashFlow(5, payload)).toBe("diubah");
    expect(put).toHaveBeenCalledWith("/cash-flows/5", payload);
  });

  it("deleteCashFlow memanggil DELETE /cash-flows/:id", async () => {
    del.mockResolvedValue({ message: "dihapus" });
    expect(await deleteCashFlow(5)).toBe("dihapus");
    expect(del).toHaveBeenCalledWith("/cash-flows/5");
  });

  it("getLabels mengambil daftar label", async () => {
    get.mockResolvedValue({ data: { labels: ["gaji"] } });
    expect(await getLabels()).toEqual(["gaji"]);
    expect(get).toHaveBeenCalledWith("/cash-flows/labels");
  });

  it("statistik harian dan bulanan dengan dan tanpa parameter", async () => {
    get.mockResolvedValue({ data: { stats_inflow: {} } });
    await getDailyStats();
    expect(get).toHaveBeenLastCalledWith("/cash-flows/stats/daily", {});
    await getDailyStats({ total_data: 7 });
    expect(get).toHaveBeenLastCalledWith("/cash-flows/stats/daily", { total_data: 7 });

    await getMonthlyStats();
    expect(get).toHaveBeenLastCalledWith("/cash-flows/stats/monthly", {});
    expect(await getMonthlyStats({ end_date: "2024-10-05 23:59:59" })).toEqual({ stats_inflow: {} });
    expect(get).toHaveBeenLastCalledWith("/cash-flows/stats/monthly", { end_date: "2024-10-05 23:59:59" });
  });

  it("deleteAllCashFlows memanggil DELETE /cash-flows", async () => {
    del.mockResolvedValue({ message: "semua dihapus" });
    expect(await deleteAllCashFlows()).toBe("semua dihapus");
    expect(del).toHaveBeenCalledWith("/cash-flows");
  });
});