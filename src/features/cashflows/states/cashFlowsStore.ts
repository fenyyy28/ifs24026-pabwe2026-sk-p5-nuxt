import { defineStore } from "pinia";
import * as cashFlowApi from "~/features/cashflows/api/cashFlowApi";
import type {
  CashFlow,
  CashFlowPayload,
  CashFlowQueryParams,
  CashFlowSource,
  CashFlowStats,
  PeriodQueryParams,
  PeriodStats,
} from "~/features/cashflows/api/cashFlowApi";

export type { CashFlow, CashFlowQueryParams, CashFlowStats };

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  dailyStats: PeriodStats | null;
  monthlyStats: PeriodStats | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: { cashflow: 0, total_inflow: 0, total_outflow: 0 },
    labels: [],
    dailyStats: null,
    monthlyStats: null,
    isLoading: false,
    isLoadingDetail: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),

  getters: {
    /** Saldo per sumber dana = total pemasukan sumber itu dikurangi total pengeluarannya. */
    balances: (state): Record<CashFlowSource, number> => {
      const balance = (source: CashFlowSource): number =>
        (state.stats[`total_inflow_${source}`] ?? 0) - (state.stats[`total_outflow_${source}`] ?? 0);
      return { cash: balance("cash"), savings: balance("savings"), loans: balance("loans") };
    },
  },

  actions: {
    async fetchCashFlows(params?: CashFlowQueryParams): Promise<void> {
      this.isLoading = true;
      try {
        const result = await cashFlowApi.getCashFlows(params);
        this.cashFlows = result.cash_flows;
        this.stats = result.stats;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCashFlow(id: number | string): Promise<void> {
      this.cashFlow = null;
      this.isLoadingDetail = true;
      try {
        this.cashFlow = await cashFlowApi.getCashFlow(id);
      } finally {
        this.isLoadingDetail = false;
      }
    },

    async fetchLabels(): Promise<void> {
      this.labels = await cashFlowApi.getLabels();
    },

    async fetchDailyStats(params?: PeriodQueryParams): Promise<void> {
      this.dailyStats = await cashFlowApi.getDailyStats(params);
    },

    async fetchMonthlyStats(params?: PeriodQueryParams): Promise<void> {
      this.monthlyStats = await cashFlowApi.getMonthlyStats(params);
    },

    async addCashFlow(payload: CashFlowPayload): Promise<string> {
      this.isCashFlowAdd = true;
      this.isCashFlowAdded = false;
      try {
        const message = await cashFlowApi.addCashFlow(payload);
        this.isCashFlowAdded = true;
        return message;
      } finally {
        this.isCashFlowAdd = false;
      }
    },

    async changeCashFlow(id: number | string, payload: CashFlowPayload): Promise<string> {
      this.isCashFlowChange = true;
      this.isCashFlowChanged = false;
      try {
        const message = await cashFlowApi.changeCashFlow(id, payload);
        this.isCashFlowChanged = true;
        return message;
      } finally {
        this.isCashFlowChange = false;
      }
    },

    async deleteCashFlow(id: number | string): Promise<string> {
      this.isCashFlowDelete = true;
      this.isCashFlowDeleted = false;
      try {
        const message = await cashFlowApi.deleteCashFlow(id);
        this.isCashFlowDeleted = true;
        return message;
      } finally {
        this.isCashFlowDelete = false;
      }
    },

    async deleteAllCashFlows(): Promise<string> {
      this.isCashFlowDeleteAll = true;
      this.isCashFlowDeletedAll = false;
      try {
        const message = await cashFlowApi.deleteAllCashFlows();
        this.isCashFlowDeletedAll = true;
        return message;
      } finally {
        this.isCashFlowDeleteAll = false;
      }
    },

    /** Mengosongkan penanda hasil mutasi (Added/Changed/Deleted/DeletedAll). */
    resetStatus(): void {
      this.isCashFlowAdded = false;
      this.isCashFlowChanged = false;
      this.isCashFlowDeleted = false;
      this.isCashFlowDeletedAll = false;
    },
  },
});