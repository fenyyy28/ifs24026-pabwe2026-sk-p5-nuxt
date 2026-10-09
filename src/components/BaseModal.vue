<script setup lang="ts">
import { X } from "lucide-vue-next";

defineProps<{
  title: string;
}>();

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
    data-testid="modal-backdrop"
    @click.self="emit('close')"
  >
    <div
      class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
        <button
          type="button"
          aria-label="Tutup"
          class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          @click="emit('close')"
        >
          <X class="size-5" />
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>