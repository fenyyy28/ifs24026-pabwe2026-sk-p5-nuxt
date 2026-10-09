<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-vue-next";
import { SOURCE_LABELS, TYPE_META } from "~/features/cashflows/constants";
import ChangeModal from "~/features/cashflows/modals/ChangeModal.vue";
import { useCashFlowsStore } from "~/features/cashflows/states/cashFlowsStore";
import type { ApiError } from "~/helpers/apiHelper";
import {
  formatDateTime,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "~/helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const store = useCashFlowsStore();

const id = route.params.cashFlowId as string;
const showChange = ref(false);

async function load(): Promise<void> {
  try {
    await store.fetchCashFlow(id);
  } catch (error) {
    await showErrorDialog((error as ApiError).message);
    await router.push("/");
  }
}

async function onSaved(): Promise<void> {
  showChange.value = false;
  await load();
}

async function handleDelete(): Promise<void> {
  if (!(await showConfirmDialog("Transaksi ini akan dihapus permanen."))) return;
  try {
    await showSuccessDialog(await store.deleteCashFlow(id));
    await router.push("/");
  } catch (error) {
    await showErrorDialog((error as ApiError).message);
  }
}

void load();
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
      <ArrowLeft class="size-4" />
      Kembali ke ringkasan
    </NuxtLink>

    <div v-if="!store.cashFlow" id="detail-skeleton" class="h-72 animate-pulse rounded-2xl bg-slate-200" />

    <template v-else>
      <section class="card">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span class="rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset" :class="TYPE_META[store.cashFlow.type].badge">
              {{ TYPE_META[store.cashFlow.type].label }}
            </span>
            <h1 class="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{{ store.cashFlow.label }}</h1>
          </div>
          <p class="text-3xl font-extrabold" :class="TYPE_META[store.cashFlow.type].amount">
            {{ TYPE_META[store.cashFlow.type].sign }}{{ formatRupiah(store.cashFlow.nominal) }}
          </p>
        </div>

        <dl class="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Jenis</dt>
            <dd class="mt-1 font-semibold text-slate-800">{{ TYPE_META[store.cashFlow.type].label }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Kategori</dt>
            <dd class="mt-1 font-semibold text-slate-800">{{ store.cashFlow.label }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Sumber dana</dt>
            <dd class="mt-1 font-semibold text-slate-800">{{ SOURCE_LABELS[store.cashFlow.source] }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Nominal</dt>
            <dd class="mt-1 font-semibold text-slate-800">{{ formatRupiah(store.cashFlow.nominal) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Dibuat</dt>
            <dd class="mt-1 text-slate-700">{{ formatDateTime(store.cashFlow.created_at) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Diperbarui</dt>
            <dd class="mt-1 text-slate-700">{{ formatDateTime(store.cashFlow.updated_at) }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Deskripsi</dt>
            <dd class="mt-1 whitespace-pre-line text-slate-700">{{ store.cashFlow.description }}</dd>
          </div>
        </dl>

        <div class="mt-8 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
          <button id="detail-delete-button" type="button" class="btn-danger" :disabled="store.isCashFlowDelete" @click="handleDelete">
            <Trash2 class="size-4" />
            Hapus
          </button>
          <button id="detail-change-button" type="button" class="btn-primary w-auto" @click="showChange = true">
            <Pencil class="size-4" />
            Ubah
          </button>
        </div>
      </section>

      <ChangeModal v-if="showChange" :cash-flow="store.cashFlow" @close="showChange = false" @saved="onSaved" />
    </template>
  </div>
</template>