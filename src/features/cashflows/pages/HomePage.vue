<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  Eye,
  FilterX,
  HandCoins,
  Pencil,
  PiggyBank,
  Plus,
  RotateCcw,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-vue-next";
import type {
  CashFlow,
  CashFlowQueryParams,
  CashFlowSource,
  CashFlowType,
} from "~/features/cashflows/api/cashFlowApi";
import { SOURCE_LABELS, SOURCE_OPTIONS, TYPE_META, TYPE_OPTIONS } from "~/features/cashflows/constants";
import AddModal from "~/features/cashflows/modals/AddModal.vue";
import ChangeModal from "~/features/cashflows/modals/ChangeModal.vue";
import { useCashFlowsStore } from "~/features/cashflows/states/cashFlowsStore";
import type { ApiError } from "~/helpers/apiHelper";
import {
  formatDate,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "~/helpers/toolsHelper";
import { useInput } from "~/hooks/useInput";

const store = useCashFlowsStore();

const { value: type, onChange: onTypeChange } = useInput("");
const { value: source, onChange: onSourceChange } = useInput("");
const { value: label, onChange: onLabelChange } = useInput("");
const { value: startDate, onChange: onStartDateInput } = useInput("");
const { value: endDate, onChange: onEndDateInput } = useInput("");

const showAdd = ref(false);
const editing = ref<CashFlow | null>(null);

const hasFilter = computed(() =>
  [type, source, label, startDate, endDate].some((field) => field.value !== ""),
);

const summary = computed(() => [
  { id: "net", label: "Total Saldo Kas Bersih", value: store.stats.cashflow, icon: Scale, tone: "bg-indigo-50 text-indigo-600" },
  { id: "inflow", label: "Total Pemasukan", value: store.stats.total_inflow, icon: TrendingUp, tone: "bg-emerald-50 text-emerald-600" },
  { id: "outflow", label: "Total Pengeluaran", value: store.stats.total_outflow, icon: TrendingDown, tone: "bg-rose-50 text-rose-600" },
  { id: "cash", label: "Saldo Kas Tunai", value: store.balances.cash, icon: Wallet, tone: "bg-amber-50 text-amber-600" },
  { id: "savings", label: "Saldo Rekening Tabungan", value: store.balances.savings, icon: PiggyBank, tone: "bg-sky-50 text-sky-600" },
  { id: "loans", label: "Saldo Pinjaman", value: store.balances.loans, icon: HandCoins, tone: "bg-violet-50 text-violet-600" },
]);

function buildParams(): CashFlowQueryParams {
  return {
    type: type.value as CashFlowType | "",
    source: source.value as CashFlowSource | "",
    label: label.value,
    start_date: startDate.value ? `${startDate.value} 00:00:00` : "",
    end_date: endDate.value ? `${endDate.value} 23:59:59` : "",
  };
}

async function loadAll(): Promise<void> {
  try {
    await Promise.all([store.fetchCashFlows(buildParams()), store.fetchLabels()]);
  } catch (error) {
    await showErrorDialog((error as ApiError).message);
  }
}

function resetFilters(): void {
  type.value = "";
  source.value = "";
  label.value = "";
  startDate.value = "";
  endDate.value = "";
}

async function onSaved(): Promise<void> {
  showAdd.value = false;
  editing.value = null;
  await loadAll();
}

async function runMutation(action: () => Promise<string>): Promise<void> {
  try {
    await showSuccessDialog(await action());
    await loadAll();
  } catch (error) {
    await showErrorDialog((error as ApiError).message);
  }
}

async function handleDelete(item: CashFlow): Promise<void> {
  if (!(await showConfirmDialog(`Transaksi "${item.label}" akan dihapus permanen.`))) return;
  await runMutation(() => store.deleteCashFlow(item.id));
}

async function handleDeleteAll(): Promise<void> {
  const confirmed = await showConfirmDialog(
    "Seluruh transaksi Anda akan dihapus permanen dan tidak bisa dikembalikan.",
    "Reset semua transaksi?",
    "Ya, hapus semua",
  );
  if (!confirmed) return;
  await runMutation(() => store.deleteAllCashFlows());
}

watch([type, source, label, startDate, endDate], loadAll);
void loadAll();
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Ringkasan Arus Kas</h1>
        <p class="mt-1 text-slate-500">Pantau saldo dan riwayat transaksi keuangan Anda.</p>
      </div>
      <div class="flex gap-2">
        <button id="reset-all-button" type="button" class="btn-danger" @click="handleDeleteAll">
          <RotateCcw class="size-4" />
          Reset semua
        </button>
        <button id="add-cashflow-button" type="button" class="btn-primary w-auto" @click="showAdd = true">
          <Plus class="size-4" />
          Tambah transaksi
        </button>
      </div>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="card in summary" :key="card.id" class="card flex items-center gap-4">
        <span class="grid size-12 shrink-0 place-items-center rounded-xl" :class="card.tone">
          <component :is="card.icon" class="size-6" />
        </span>
        <div class="min-w-0">
          <p class="text-sm text-slate-500">{{ card.label }}</p>
          <p class="truncate text-xl font-extrabold text-slate-900">{{ formatRupiah(card.value) }}</p>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label for="filter-type-select" class="mb-1 block text-xs font-semibold text-slate-500">Jenis</label>
          <select id="filter-type-select" class="input-plain" :value="type" @change="onTypeChange">
            <option value="">Semua</option>
            <option v-for="option in TYPE_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div>
          <label for="filter-source-select" class="mb-1 block text-xs font-semibold text-slate-500">Sumber dana</label>
          <select id="filter-source-select" class="input-plain" :value="source" @change="onSourceChange">
            <option value="">Semua</option>
            <option v-for="option in SOURCE_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div>
          <label for="filter-label-select" class="mb-1 block text-xs font-semibold text-slate-500">Label</label>
          <select id="filter-label-select" class="input-plain" :value="label" @change="onLabelChange">
            <option value="">Semua</option>
            <option v-for="item in store.labels" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
        <div>
          <label for="filter-start-input" class="mb-1 block text-xs font-semibold text-slate-500">Tanggal awal</label>
          <input id="filter-start-input" type="date" class="input-plain" :value="startDate" @input="onStartDateInput" />
        </div>
        <div>
          <label for="filter-end-input" class="mb-1 block text-xs font-semibold text-slate-500">Tanggal akhir</label>
          <input id="filter-end-input" type="date" class="input-plain" :value="endDate" @input="onEndDateInput" />
        </div>
      </div>
      <div v-if="hasFilter" class="mt-3 flex justify-end">
        <button id="filter-reset-button" type="button" class="btn-secondary" @click="resetFilters">
          <FilterX class="size-4" />
          Atur ulang filter
        </button>
      </div>
    </section>

    <div v-if="store.isLoading" id="cashflow-skeleton" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-16 animate-pulse rounded-2xl bg-slate-200" />
    </div>

    <div
      v-else-if="store.cashFlows.length === 0"
      id="cashflow-empty"
      class="card flex flex-col items-center gap-2 py-12 text-center text-slate-500"
    >
      <Wallet class="size-8 text-slate-400" />
      <p class="font-semibold text-slate-700">Belum ada transaksi</p>
      <p class="text-sm">Tambahkan transaksi pertama Anda atau ubah filter.</p>
    </div>

    <div v-else>
      <div class="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Tanggal</th>
              <th class="px-4 py-3">Label</th>
              <th class="px-4 py-3">Sumber</th>
              <th class="px-4 py-3">Jenis</th>
              <th class="px-4 py-3 text-right">Nominal</th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in store.cashFlows" :key="item.id" class="hover:bg-slate-50/60">
              <td class="whitespace-nowrap px-4 py-3 text-slate-500">{{ formatDate(item.created_at) }}</td>
              <td class="px-4 py-3 font-semibold text-slate-800">{{ item.label }}</td>
              <td class="px-4 py-3 text-slate-600">{{ SOURCE_LABELS[item.source] }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset" :class="TYPE_META[item.type].badge">
                  {{ TYPE_META[item.type].label }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-right font-bold" :class="TYPE_META[item.type].amount">
                {{ TYPE_META[item.type].sign }}{{ formatRupiah(item.nominal) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <NuxtLink :to="`/cash-flows/${item.id}`" aria-label="Lihat detail" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                    <Eye class="size-4" />
                  </NuxtLink>
                  <button type="button" data-action="edit" aria-label="Ubah transaksi" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" @click="editing = item">
                    <Pencil class="size-4" />
                  </button>
                  <button type="button" data-action="delete" aria-label="Hapus transaksi" class="rounded-lg p-2 text-rose-500 hover:bg-rose-50" @click="handleDelete(item)">
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul class="space-y-3 md:hidden">
        <li v-for="item in store.cashFlows" :key="item.id" class="card">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-semibold text-slate-800">{{ item.label }}</p>
              <p class="mt-0.5 text-xs text-slate-500">
                {{ formatDate(item.created_at) }} · {{ SOURCE_LABELS[item.source] }}
              </p>
            </div>
            <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset" :class="TYPE_META[item.type].badge">
              {{ TYPE_META[item.type].label }}
            </span>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <p class="text-lg font-extrabold" :class="TYPE_META[item.type].amount">
              {{ TYPE_META[item.type].sign }}{{ formatRupiah(item.nominal) }}
            </p>
            <div class="flex gap-1">
              <NuxtLink :to="`/cash-flows/${item.id}`" aria-label="Lihat detail" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <Eye class="size-4" />
              </NuxtLink>
              <button type="button" data-action="edit" aria-label="Ubah transaksi" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" @click="editing = item">
                <Pencil class="size-4" />
              </button>
              <button type="button" data-action="delete" aria-label="Hapus transaksi" class="rounded-lg p-2 text-rose-500 hover:bg-rose-50" @click="handleDelete(item)">
                <Trash2 class="size-4" />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <AddModal v-if="showAdd" @close="showAdd = false" @saved="onSaved" />
    <ChangeModal v-if="editing" :cash-flow="editing" @close="editing = null" @saved="onSaved" />
  </div>
</template>