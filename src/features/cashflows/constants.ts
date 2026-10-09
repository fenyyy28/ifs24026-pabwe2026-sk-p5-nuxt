import type { CashFlowSource, CashFlowType } from "~/features/cashflows/api/cashFlowApi";

export const TYPE_META: Record<
  CashFlowType,
  { label: string; badge: string; amount: string; sign: string }
> = {
  inflow: {
    label: "Pemasukan",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amount: "text-emerald-600",
    sign: "+",
  },
  outflow: {
    label: "Pengeluaran",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
    amount: "text-rose-600",
    sign: "-",
  },
};

export const SOURCE_LABELS: Record<CashFlowSource, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};

export const TYPE_OPTIONS = (Object.keys(TYPE_META) as CashFlowType[]).map((value) => ({
  value,
  label: TYPE_META[value].label,
}));

export const SOURCE_OPTIONS = (Object.keys(SOURCE_LABELS) as CashFlowSource[]).map((value) => ({
  value,
  label: SOURCE_LABELS[value],
}));