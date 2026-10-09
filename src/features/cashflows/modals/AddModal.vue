<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "~/components/BaseModal.vue";
import type { CashFlowPayload } from "~/features/cashflows/api/cashFlowApi";
import CashFlowForm from "~/features/cashflows/components/CashFlowForm.vue";
import { useCashFlowsStore } from "~/features/cashflows/states/cashFlowsStore";
import type { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";

const emit = defineEmits<{ close: []; saved: [] }>();

const store = useCashFlowsStore();
const errors = ref<Record<string, string[]>>({});

async function handleSubmit(payload: CashFlowPayload): Promise<void> {
  errors.value = {};
  try {
    await showSuccessDialog(await store.addCashFlow(payload));
    emit("saved");
  } catch (error) {
    const apiError = error as ApiError;
    errors.value = apiError.errors;
    await showErrorDialog(apiError.message);
  }
}
</script>

<template>
  <BaseModal title="Tambah Transaksi" @close="emit('close')">
    <CashFlowForm
      :labels="store.labels"
      :is-submitting="store.isCashFlowAdd"
      :errors="errors"
      submit-text="Simpan transaksi"
      @submit="handleSubmit"
    />
  </BaseModal>
</template>