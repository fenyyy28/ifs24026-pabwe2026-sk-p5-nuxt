<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "~/components/BaseModal.vue";
import type { CashFlow, CashFlowPayload } from "~/features/cashflows/api/cashFlowApi";
import CashFlowForm from "~/features/cashflows/components/CashFlowForm.vue";
import { useCashFlowsStore } from "~/features/cashflows/states/cashFlowsStore";
import type { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";

const props = defineProps<{
  cashFlow: CashFlow;
}>();

const emit = defineEmits<{ close: []; saved: [] }>();

const store = useCashFlowsStore();
const errors = ref<Record<string, string[]>>({});

async function handleSubmit(payload: CashFlowPayload): Promise<void> {
  errors.value = {};
  try {
    await showSuccessDialog(await store.changeCashFlow(props.cashFlow.id, payload));
    emit("saved");
  } catch (error) {
    const apiError = error as ApiError;
    errors.value = apiError.errors;
    await showErrorDialog(apiError.message);
  }
}
</script>

<template>
  <BaseModal title="Ubah Transaksi" @close="emit('close')">
    <CashFlowForm
      :initial="cashFlow"
      :labels="store.labels"
      :is-submitting="store.isCashFlowChange"
      :errors="errors"
      submit-text="Simpan perubahan"
      @submit="handleSubmit"
    />
  </BaseModal>
</template>