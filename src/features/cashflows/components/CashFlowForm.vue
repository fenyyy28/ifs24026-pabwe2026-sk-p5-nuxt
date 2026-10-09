<script setup lang="ts">
import { Save } from "lucide-vue-next";
import type {
  CashFlow,
  CashFlowPayload,
  CashFlowSource,
  CashFlowType,
} from "~/features/cashflows/api/cashFlowApi";
import { SOURCE_OPTIONS, TYPE_OPTIONS } from "~/features/cashflows/constants";
import { useInput } from "~/hooks/useInput";

const props = defineProps<{
  initial?: CashFlow | null;
  labels: string[];
  isSubmitting: boolean;
  errors: Record<string, string[]>;
  submitText: string;
}>();

const emit = defineEmits<{ submit: [payload: CashFlowPayload] }>();

const base = props.initial ?? { type: "inflow", source: "cash", label: "", description: "", nominal: 0 };

const { value: type, onChange: onTypeChange } = useInput<string>(base.type);
const { value: source, onChange: onSourceChange } = useInput<string>(base.source);
const { value: label, onChange: onLabelInput } = useInput<string>(base.label);
const { value: nominal, onChange: onNominalInput } = useInput<number>(base.nominal);
const { value: description, onChange: onDescriptionInput } = useInput<string>(base.description);

function handleSubmit(): void {
  emit("submit", {
    type: type.value as CashFlowType,
    source: source.value as CashFlowSource,
    label: label.value.trim(),
    description: description.value,
    nominal: nominal.value,
  });
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label for="cashflow-type-input" class="mb-1.5 block text-sm font-semibold text-slate-700">Jenis</label>
        <select id="cashflow-type-input" class="input-plain" :value="type" @change="onTypeChange">
          <option v-for="option in TYPE_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p v-if="errors.type" class="mt-1.5 text-xs text-rose-600">{{ errors.type[0] }}</p>
      </div>
      <div>
        <label for="cashflow-source-input" class="mb-1.5 block text-sm font-semibold text-slate-700">Sumber dana</label>
        <select id="cashflow-source-input" class="input-plain" :value="source" @change="onSourceChange">
          <option v-for="option in SOURCE_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p v-if="errors.source" class="mt-1.5 text-xs text-rose-600">{{ errors.source[0] }}</p>
      </div>
    </div>

    <div>
      <label for="cashflow-label-input" class="mb-1.5 block text-sm font-semibold text-slate-700">Label kategori</label>
      <input
        id="cashflow-label-input"
        type="text"
        list="cashflow-label-options"
        placeholder="Contoh: gaji, alat-mandi"
        class="input-plain"
        :value="label"
        @input="onLabelInput"
      />
      <datalist id="cashflow-label-options">
        <option v-for="item in labels" :key="item" :value="item" />
      </datalist>
      <p v-if="errors.label" class="mt-1.5 text-xs text-rose-600">{{ errors.label[0] }}</p>
    </div>

    <div>
      <label for="cashflow-nominal-input" class="mb-1.5 block text-sm font-semibold text-slate-700">Nominal (Rupiah)</label>
      <input
        id="cashflow-nominal-input"
        type="number"
        min="0"
        class="input-plain"
        :value="nominal"
        @input="onNominalInput"
      />
      <p v-if="errors.nominal" class="mt-1.5 text-xs text-rose-600">{{ errors.nominal[0] }}</p>
    </div>

    <div>
      <label for="cashflow-description-input" class="mb-1.5 block text-sm font-semibold text-slate-700">Keterangan</label>
      <textarea
        id="cashflow-description-input"
        rows="3"
        placeholder="Catatan singkat transaksi"
        class="input-plain resize-none"
        :value="description"
        @input="onDescriptionInput"
      />
      <p v-if="errors.description" class="mt-1.5 text-xs text-rose-600">{{ errors.description[0] }}</p>
    </div>

    <div class="flex justify-end pt-2">
      <button id="cashflow-submit-button" type="submit" class="btn-primary sm:w-auto" :disabled="isSubmitting">
        <Save class="size-4" />
        {{ submitText }}
      </button>
    </div>
  </form>
</template>