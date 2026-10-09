import type { CashFlow, CashFlowStats } from "~/features/cashflows/api/cashFlowApi";

export const inflow: CashFlow = {
  id: 2,
  user_id: 1,
  type: "inflow",
  source: "cash",
  label: "gaji",
  description: "Gaji bulanan",
  nominal: 2500000,
  created_at: "2024-10-05T11:26:45.000000Z",
  updated_at: "2024-10-05T11:26:48.000000Z",
};

export const outflow: CashFlow = {
  id: 4,
  user_id: 1,
  type: "outflow",
  source: "savings",
  label: "alat-elektronik",
  description: "Membeli keyboard dan mouse",
  nominal: 400000,
  created_at: "2024-10-05T12:09:16.000000Z",
  updated_at: "2024-10-05T12:09:16.000000Z",
};

export const cashFlows: CashFlow[] = [outflow, inflow];

export const stats: CashFlowStats = {
  cashflow: 2100000,
  total_inflow: 2500000,
  total_outflow: 400000,
  total_inflow_cash: 2500000,
  total_outflow_savings: 400000,
};