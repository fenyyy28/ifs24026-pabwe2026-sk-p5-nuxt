import { apiDelete, apiGet, apiPost, apiPut } from "~/helpers/apiHelper";

export type CashFlowType = "inflow" | "outflow";
export type CashFlowSource = "cash" | "savings" | "loans";

export interface CashFlow {
  id: number;
  user_id: number;
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
  created_at: string;
  updated_at: string;
}

/** Ringkasan saldo. Selain tiga kunci utama, server mengirim kunci dinamis (total_inflow_cash, dst). */
export interface CashFlowStats {
  cashflow: number;
  total_inflow: number;
  total_outflow: number;
  [key: string]: number;
}

export interface CashFlowPayload {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
}

export interface CashFlowQueryParams {
  type?: CashFlowType | "";
  source?: CashFlowSource | "";
  label?: string;
  /** Contoh: "2024-10-05 00:00:00" */
  start_date?: string;
  /** Contoh: "2024-10-05 23:59:59" */
  end_date?: string;
}

export interface PeriodQueryParams {
  end_date?: string;
  total_data?: number;
}

export interface PeriodStats {
  stats_inflow: Record<string, number>;
  stats_outflow: Record<string, number>;
  stats_cashflow: Record<string, number>;
}

export interface CashFlowList {
  cash_flows: CashFlow[];
  stats: CashFlowStats;
}

/** GET /cash-flows */
export async function getCashFlows(params: CashFlowQueryParams = {}): Promise<CashFlowList> {
  const response = await apiGet<CashFlowList>("/cash-flows", { ...params });
  return response.data;
}

/** GET /cash-flows/:id */
export async function getCashFlow(id: number | string): Promise<CashFlow> {
  const response = await apiGet<{ cash_flow: CashFlow }>(`/cash-flows/${id}`);
  return response.data.cash_flow;
}

/** POST /cash-flows. Mengembalikan pesan sukses. */
export async function addCashFlow(payload: CashFlowPayload): Promise<string> {
  const response = await apiPost("/cash-flows", payload);
  return response.message;
}

/** PUT /cash-flows/:id. Mengembalikan pesan sukses. */
export async function changeCashFlow(id: number | string, payload: CashFlowPayload): Promise<string> {
  const response = await apiPut(`/cash-flows/${id}`, payload);
  return response.message;
}

/** DELETE /cash-flows/:id. Mengembalikan pesan sukses. */
export async function deleteCashFlow(id: number | string): Promise<string> {
  const response = await apiDelete(`/cash-flows/${id}`);
  return response.message;
}

/** GET /cash-flows/labels */
export async function getLabels(): Promise<string[]> {
  const response = await apiGet<{ labels: string[] }>("/cash-flows/labels");
  return response.data.labels;
}

/** GET /cash-flows/stats/daily */
export async function getDailyStats(params: PeriodQueryParams = {}): Promise<PeriodStats> {
  const response = await apiGet<PeriodStats>("/cash-flows/stats/daily", { ...params });
  return response.data;
}

/** GET /cash-flows/stats/monthly */
export async function getMonthlyStats(params: PeriodQueryParams = {}): Promise<PeriodStats> {
  const response = await apiGet<PeriodStats>("/cash-flows/stats/monthly", { ...params });
  return response.data;
}

/** DELETE /cash-flows. Menghapus SELURUH catatan milik pengguna. */
export async function deleteAllCashFlows(): Promise<string> {
  const response = await apiDelete("/cash-flows");
  return response.message;
}