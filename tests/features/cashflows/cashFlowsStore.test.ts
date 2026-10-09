import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import * as api from "~/features/cashflows/api/cashFlowApi";
import { useCashFlowsStore } from "~/features/cashflows/states/cashFlowsStore";
import { cashFlows, inflow, stats } from "../../support/fixtures";

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

const mocked = api as unknown as Record<string, ReturnType<typeof vi.fn>>;
const payload = { type: "inflow", source: "cash", label: "gaji", description: "x", nominal: 1 } as const;

beforeEach(() => {
  Object.values(mocked).forEach((fn) => fn.mockReset());
  setActivePinia(createPinia());
});

describe("useCashFlowsStore", () => {
  it("fetchCashFlows mengisi daftar dan statistik serta mengatur loading", async () => {
    let resolve!: (v: unknown) => void;
    mocked.getCashFlows!.mockReturnValue(new Promise((r) => (resolve = r)));
    const store = useCashFlowsStore();
    const pending = store.fetchCashFlows({ type: "inflow" });
    expect(store.isLoading).toBe(true);
    resolve({ cash_flows: cashFlows, stats });
    await pending;
    expect(store.isLoading).toBe(false);
    expect(store.cashFlows).toEqual(cashFlows);
    expect(store.stats).toEqual(stats);
    expect(mocked.getCashFlows).toHaveBeenCalledWith({ type: "inflow" });
  });

  it("fetchCashFlows yang gagal mengembalikan loading", async () => {
    mocked.getCashFlows!.mockRejectedValue(new Error("gagal"));
    const store = useCashFlowsStore();
    await expect(store.fetchCashFlows()).rejects.toThrow("gagal");
    expect(store.isLoading).toBe(false);
  });

  it("fetchCashFlow mengosongkan detail lama lalu mengisi yang baru", async () => {
    let resolve!: (v: unknown) => void;
    mocked.getCashFlow!.mockReturnValue(new Promise((r) => (resolve = r)));
    const store = useCashFlowsStore();
    store.cashFlow = inflow;
    const pending = store.fetchCashFlow(2);
    expect(store.cashFlow).toBeNull();
    expect(store.isLoadingDetail).toBe(true);
    resolve(inflow);
    await pending;
    expect(store.cashFlow).toEqual(inflow);
    expect(store.isLoadingDetail).toBe(false);
  });

  it("fetchCashFlow yang gagal mengembalikan loading detail", async () => {
    mocked.getCashFlow!.mockRejectedValue(new Error("gagal"));
    const store = useCashFlowsStore();
    await expect(store.fetchCashFlow(1)).rejects.toThrow();
    expect(store.isLoadingDetail).toBe(false);
  });

  it("fetchLabels, fetchDailyStats, fetchMonthlyStats", async () => {
    mocked.getLabels!.mockResolvedValue(["gaji"]);
    mocked.getDailyStats!.mockResolvedValue({ stats_inflow: { "05-10-2024": 1 } });
    mocked.getMonthlyStats!.mockResolvedValue({ stats_inflow: { "10-2024": 1 } });
    const store = useCashFlowsStore();
    await store.fetchLabels();
    await store.fetchDailyStats({ total_data: 7 });
    await store.fetchMonthlyStats();
    expect(store.labels).toEqual(["gaji"]);
    expect(store.dailyStats).toEqual({ stats_inflow: { "05-10-2024": 1 } });
    expect(store.monthlyStats).toEqual({ stats_inflow: { "10-2024": 1 } });
    expect(mocked.getDailyStats).toHaveBeenCalledWith({ total_data: 7 });
  });

  it("balances menghitung saldo per sumber dana (kunci hilang dianggap 0)", () => {
    const store = useCashFlowsStore();
    store.stats = stats;
    expect(store.balances).toEqual({ cash: 2500000, savings: -400000, loans: 0 });
  });

  it.each([
    ["addCashFlow", "addCashFlow", "isCashFlowAdd", "isCashFlowAdded", [payload]],
    ["changeCashFlow", "changeCashFlow", "isCashFlowChange", "isCashFlowChanged", [7, payload]],
    ["deleteCashFlow", "deleteCashFlow", "isCashFlowDelete", "isCashFlowDeleted", [7]],
    ["deleteAllCashFlows", "deleteAllCashFlows", "isCashFlowDeleteAll", "isCashFlowDeletedAll", []],
  ] as const)("%s mengatur penanda proses dan hasil", async (action, apiName, busyFlag, doneFlag, args) => {
    let resolve!: (v: string) => void;
    mocked[apiName]!.mockReturnValue(new Promise((r) => (resolve = r)));
    const store = useCashFlowsStore();
    const run = store[action] as (...a: unknown[]) => Promise<string>;

    const pending = run.apply(store, args as unknown[]);
    expect(store[busyFlag]).toBe(true);
    expect(store[doneFlag]).toBe(false);
    resolve("selesai");
    expect(await pending).toBe("selesai");
    expect(store[busyFlag]).toBe(false);
    expect(store[doneFlag]).toBe(true);
  });

  it.each([
    ["addCashFlow", "isCashFlowAdd", "isCashFlowAdded", [payload]],
    ["changeCashFlow", "isCashFlowChange", "isCashFlowChanged", [7, payload]],
    ["deleteCashFlow", "isCashFlowDelete", "isCashFlowDeleted", [7]],
    ["deleteAllCashFlows", "isCashFlowDeleteAll", "isCashFlowDeletedAll", []],
  ] as const)("%s yang gagal tidak menandai berhasil", async (action, busyFlag, doneFlag, args) => {
    mocked[action]!.mockRejectedValue(new Error("gagal"));
    const store = useCashFlowsStore();
    const run = store[action] as (...a: unknown[]) => Promise<string>;
    await expect(run.apply(store, args as unknown[])).rejects.toThrow("gagal");
    expect(store[busyFlag]).toBe(false);
    expect(store[doneFlag]).toBe(false);
  });

  it("resetStatus mengosongkan semua penanda hasil", () => {
    const store = useCashFlowsStore();
    store.isCashFlowAdded = true;
    store.isCashFlowChanged = true;
    store.isCashFlowDeleted = true;
    store.isCashFlowDeletedAll = true;
    store.resetStatus();
    expect(store.isCashFlowAdded).toBe(false);
    expect(store.isCashFlowChanged).toBe(false);
    expect(store.isCashFlowDeleted).toBe(false);
    expect(store.isCashFlowDeletedAll).toBe(false);
  });
});